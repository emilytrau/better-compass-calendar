"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db = require("./../../db");
const errors = require("./errors");
const SqlString = require("sqlstring");
const columns = 'id, title, description, activity_id, location_id, manager_id, all_day, cancelled, start_time, end_time, has_changed, hash';
/**
 * Converts database response to Event
 */
const formatData = (data) => {
    return {
        id: data.id,
        title: data.title,
        description: data.description,
        activityId: data.activity_id,
        locationId: data.location_id,
        managerId: data.manager_id,
        allDay: data.all_day === 1,
        cancelled: data.cancelled === 1,
        startTime: new Date(data.start_time),
        endTime: new Date(data.end_time),
        hasChanged: data.has_changed === 1,
        hash: data.hash
    };
};
/**
 * Retrieves event data from the DB
 * @async
 * @param {string} id
 * @returns {Promise<Event>}
 */
exports.getEvent = async (id) => {
    const data = await db.get(`SELECT ${columns} FROM Events WHERE id = $1`, id);
    if (!data) {
        throw errors.EVENT_NOT_FOUND;
    }
    return formatData(data);
};
/**
 * Saves event data into the DB
 * @async
 * @param {Event} event
 */
exports.saveEvent = async (event) => {
    await db.run(`REPLACE INTO Events (${columns}) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`, event.id, event.title, event.description, event.activityId, event.locationId, event.managerId, event.allDay ? 1 : 0, event.cancelled ? 1 : 0, event.startTime.getTime(), event.endTime.getTime(), event.hasChanged ? 1 : 0, event.hash);
};
/**
 * Escapes user input into an SQL safe string
 * @param text
 */
const escape = (text) => {
    const escaped = SqlString.escape(text.toString());
    const escapedWithoutQuotes = escaped.substring(1, escaped.length - 1);
    return '"' + escapedWithoutQuotes.replace(/\\"/g, '""').replace(/\\'/g, "''") + '"';
};
/**
 * Perform a query for events
 * @param query
 */
exports.queryEvents = async (query) => {
    // Assemble simple filters into query
    let filters = [];
    if (query.keywords && query.keywords.length > 0)
        filters.push(`${escape(query.keywords.join(' '))}`);
    if (query.title)
        filters.push(`(title : ${escape(query.title)})`);
    if (query.location)
        filters.push(`({ location_short location_full } : ${escape(query.location)})`);
    if (query.locationId)
        filters.push(`(location_id : ${escape(query.locationId)})`);
    if (query.manager)
        filters.push(`(manager_full : ${escape(query.manager)})`);
    if (query.managerId)
        filters.push(`(manager_id : ${escape(query.managerId)})`);
    // Assemble the SQL statement
    let sql = `SELECT ${columns} from Events WHERE 1=1`;
    sql += filters.length > 0 ? ` AND id IN (SELECT id FROM EventsIndex WHERE EventsIndex MATCH '${filters.join(' AND ')}' ORDER BY rank)` : '';
    sql += query.subscribedUserId ? ` AND activity_id IN (SELECT activity_id FROM Subscriptions WHERE user_id = $subscribedUserId)` : '';
    sql += query.after ? ` AND (start_time >= $after)` : '';
    sql += query.before ? ` AND (end_time <= $before)` : '';
    sql += query.orderBy === 'latest' ? ' ORDER BY start_time DESC' : query.orderBy === 'oldest' ? ' ORDER BY start_time ASC' : '';
    // Performn the SQL query, passing in named parameters
    const results = await db.all(sql, {
        $subscribedUserId: query.subscribedUserId || undefined,
        $after: query.after ? query.after.getTime() : undefined,
        $before: query.before ? query.before.getTime() : undefined
    });
    return results.map(result => formatData(result));
};
//# sourceMappingURL=event.js.map