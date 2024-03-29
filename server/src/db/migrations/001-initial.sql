--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE Users (
    id            INTEGER PRIMARY KEY,
    display_code  TEXT    NOT NULL,
    full_name     TEXT    NOT NULL,
    email         TEXT    NOT NULL,
    is_manager    INTEGER NOT NULL,
    is_admin      INTEGER NOT NULL
);

CREATE TABLE AuthTokens (
    token         TEXT    PRIMARY KEY,
    expires       INTEGER NOT NULL,
    user_id       INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    compass_token TEXT    NOT NULL
);

CREATE TABLE Activities (
    id INTEGER PRIMARY KEY
);

CREATE TABLE Locations (
    id         INTEGER PRIMARY KEY,
    full_name  TEXT    NOT NULL,
    short_name TEXT    NOT NULL
);

CREATE TABLE Events (
    id          TEXT    PRIMARY KEY,
    title       TEXT    NOT NULL,
    description TEXT    NOT NULL,
    activity_id INTEGER NOT NULL REFERENCES Activities(id) ON DELETE CASCADE,
    location_id INTEGER          REFERENCES Locations(id) ON DELETE CASCADE,
    manager_id  INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    all_day     INTEGER NOT NULL,
    cancelled   INTEGER NOT NULL,
    start_time  INTEGER NOT NULL,
    end_time    INTEGER NOT NULL,
    has_changed INTEGER NOT NULL,
    hash        TEXT    NOT NULL
);

CREATE VIRTUAL TABLE EventsIndex USING fts5 (
    id UNINDEXED,
    title,
    description,
    location_id,
    location_short,
    location_full,
    manager_id,
    manager_full,
    tokenize=porter
);

CREATE TRIGGER Events_Insert AFTER INSERT ON Events BEGIN
    INSERT INTO EventsIndex (
        id, 
        title, 
        description,
        location_id,
        location_short,
        location_full,
        manager_id,
        manager_full
    )
    VALUES (
        new.id,
        new.title,
        new.description,
        new.location_id,
        (SELECT short_name FROM Locations WHERE id = new.location_id),
        (SELECT full_name FROM Locations WHERE id = new.location_id),
        new.manager_id,
        (SELECT full_name FROM Users WHERE id = new.manager_id)
    );
END;

CREATE TRIGGER Events_Update UPDATE OF hash ON Events BEGIN
    UPDATE EventsIndex SET 
        title = new.title,
        description = new.description,
        location_id = new.location_id,
        location_short = (SELECT short_name FROM Locations WHERE id = new.location_id),
        location_full = (SELECT full_name FROM Locations WHERE id = new.location_id),
        manager_id = new.manager_id,
        manager_full = (SELECT full_name FROM Users WHERE id = new.manager_id)
    WHERE id = old.id;
END;

CREATE TRIGGER Events_Delete AFTER DELETE ON Events BEGIN
    DELETE FROM EventsIndex WHERE id = old.id;
END;

CREATE TABLE Subscriptions (
    user_id     INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    activity_id INTEGER NOT NULL REFERENCES Activities(id) ON DELETE CASCADE,
    PRIMARY KEY(user_id, activity_id)
);

CREATE TABLE PushSubscriptions (
    user_id     INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    device_name TEXT NOT NULL,
    endpoint    TEXT PRIMARY KEY,
    key_p256dh  TEXT NOT NULL,
    key_auth    TEXT NOT NULL
);

CREATE TABLE RequestLog (
    log_time INTEGER NOT NULL,
    method TEXT NOT NULL,
    uri TEXT NOT NULL,
    response_time NUMBER NOT NULL
);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE Users;
DROP TABLE AuthTokens;
DROP TABLE Activities;
DROP TABLE Locations;
DROP TABLE Events;
DROP TABLE EventsIndex;
DROP TABLE Subscriptions;
DROP TABLE PushSubscriptions;
DROP TABLE RequestLog;