SONGS = "/songs/"

SONG_FIELDS = ("title", "artist", "album", "year", "bpm", "song_lines")


def song_payload(**overrides):
    payload = {
        "title": "Paper Boats",
        "artist": "The Placeholders",
        "album": "Test Pressing",
        "year": 2024,
        "bpm": 96,
        "song_lines": [
            # Blank line = instrumental gap (e.g. intro)
            {"line_text": "", "chords": ["Em7", "G", "Dsus4", "A7sus4"]},
            {"line_text": "Folding every letter into something that floats", "chords": ["Em7", "G"]},
            {"line_text": "Sending them downriver", "chords": ["Dsus4"]},
            {"line_text": "Spoken outro with no chords", "chords": []},
        ],
    }
    payload.update(overrides)
    return payload


def song_fields(body):
    return {field: body[field] for field in SONG_FIELDS}


async def create_song(client, **overrides):
    response = await client.post(SONGS, json=song_payload(**overrides))
    assert response.status_code == 200, response.text
    return response.json()


# --- create ---------------------------------------------------------------


async def test_create_song_returns_created_song(client):
    payload = song_payload()

    response = await client.post(SONGS, json=payload)

    assert response.status_code == 200, response.text
    body = response.json()
    assert song_fields(body) == payload
    assert body["uuid"]


async def test_create_song_preserves_line_order_and_chords(client):
    payload = song_payload()

    body = await create_song(client)

    assert body["song_lines"] == payload["song_lines"]


async def test_create_song_applies_defaults(client):
    response = await client.post(SONGS, json={"title": "Untitled Jam"})

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["artist"] == "Unknown"
    assert body["album"] == "Unknown"
    assert body["year"] is None
    assert body["bpm"] == 120
    assert body["song_lines"] == []


async def test_create_song_defaults_missing_line_text_to_blank(client):
    body = await create_song(client, song_lines=[{"chords": ["C", "G"]}])

    assert body["song_lines"] == [{"line_text": "", "chords": ["C", "G"]}]


async def test_created_songs_get_distinct_uuids(client):
    first = await create_song(client)
    second = await create_song(client)

    assert first["uuid"] != second["uuid"]


async def test_create_song_requires_title(client):
    payload = song_payload()
    del payload["title"]

    response = await client.post(SONGS, json=payload)

    assert response.status_code == 422


async def test_create_song_rejects_non_integer_bpm(client):
    response = await client.post(SONGS, json=song_payload(bpm="fast"))

    assert response.status_code == 422


async def test_create_song_rejects_malformed_song_lines(client):
    response = await client.post(
        SONGS, json=song_payload(song_lines=[{"line_text": "hi", "chords": "C G"}])
    )

    assert response.status_code == 422


# --- read -----------------------------------------------------------------


async def test_get_song(client):
    created = await create_song(client)

    response = await client.get(f"{SONGS}{created['uuid']}")

    assert response.status_code == 200, response.text
    assert song_fields(response.json()) == song_fields(created)


async def test_get_unknown_song_returns_404(client):
    response = await client.get(f"{SONGS}00000000-0000-0000-0000-000000000000")

    assert response.status_code == 404


# --- update ---------------------------------------------------------------


async def test_patch_song_with_full_body(client):
    created = await create_song(client)
    update = song_payload(
        title="Paper Boats (Live)",
        bpm=104,
        song_lines=[{"line_text": "New opening line", "chords": ["A", "E"]}],
    )

    response = await client.patch(f"{SONGS}{created['uuid']}", json=update)

    assert response.status_code == 200, response.text
    assert song_fields(response.json()) == update


async def test_patch_song_persists_changes(client):
    created = await create_song(client)
    update = song_payload(bpm=140)

    await client.patch(f"{SONGS}{created['uuid']}", json=update)
    response = await client.get(f"{SONGS}{created['uuid']}")

    assert response.status_code == 200, response.text
    assert response.json()["bpm"] == 140


async def test_patch_song_partial_update_keeps_other_fields(client):
    created = await create_song(client)

    response = await client.patch(f"{SONGS}{created['uuid']}", json={"bpm": 110})

    assert response.status_code == 200, response.text
    assert song_fields(response.json()) == {**song_fields(created), "bpm": 110}


async def test_patch_song_keeps_uuid(client):
    created = await create_song(client)

    response = await client.patch(
        f"{SONGS}{created['uuid']}", json=song_payload(title="Renamed")
    )

    assert response.status_code == 200, response.text
    assert response.json()["uuid"] == created["uuid"]


async def test_patch_unknown_song_returns_404(client):
    response = await client.patch(
        f"{SONGS}00000000-0000-0000-0000-000000000000", json=song_payload()
    )

    assert response.status_code == 404


# --- delete ---------------------------------------------------------------


async def test_delete_song(client):
    created = await create_song(client)

    response = await client.delete(f"{SONGS}{created['uuid']}")

    assert response.status_code in (200, 204), response.text
    follow_up = await client.get(f"{SONGS}{created['uuid']}")
    assert follow_up.status_code == 404


async def test_delete_only_removes_target_song(client):
    keep = await create_song(client, title="Keep Me")
    remove = await create_song(client, title="Remove Me")

    await client.delete(f"{SONGS}{remove['uuid']}")

    response = await client.get(f"{SONGS}{keep['uuid']}")
    assert response.status_code == 200, response.text
    assert response.json()["title"] == "Keep Me"


async def test_delete_unknown_song_returns_404(client):
    response = await client.delete(f"{SONGS}00000000-0000-0000-0000-000000000000")

    assert response.status_code == 404
