import db = require('./../../db');
import errors = require('./errors');
import SqlString = require('sqlstring');

export interface Event {
    id: string;
    title: string;
    description: string;
    activityId: number;
    locationId: number | null;
    managerId: number;
    allDay: boolean;
    cancelled: boolean;
    startTime: Date;
    endTime: Date;
    hash: string;
}

export interface Query {
    keywords: string | undefined;
    title: string | undefined;
    location: string | undefined;
    locationId: number | undefined;
    manager: string | undefined;
    managerId: number | undefined;
    after: Date | undefined;
    before: Date | undefined;
    orderBy: 'newest' | 'oldest' | 'relevance';
}

const columns = 'id, title, description, activity_id, location_id, manager_id, all_day, cancelled, start_time, end_time, hash';

/**
 * Retrieves event data from the DB
 * @async
 * @param {string} id
 * @returns {Promise<Event>}
 */
export const getEvent = async (id: string): Promise<Event> => {
    const data = await db.get(`SELECT ${columns} FROM Events WHERE id = $1`, id);
    if (!data) {
        throw errors.EVENT_NOT_FOUND;
    }

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
        hash: data.hash
    }
}

/**
 * Saves event data into the DB
 * @async
 * @param {Event} event 
 */
export const saveEvent = async (event: Event) => {
    await db.run(
        `REPLACE INTO Events (${columns}) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        event.id,
        event.title,
        event.description,
        event.activityId,
        event.locationId,
        event.managerId,
        event.allDay ? 1 : 0,
        event.cancelled ? 1 : 0,
        event.startTime.getTime(),
        event.endTime.getTime(),
        event.hash
    );
}

const escape = (text: any) => {
    const escaped = SqlString.escape(text.toString());
    const escapedWithoutQuotes = escaped.substring(1, escaped.length - 1);
    return '"' + escapedWithoutQuotes.replace(/\\"/g, '""').replace(/\\'/g, "''") + '"';
}

export const queryEvents = async (query: Query): Promise<Event[]> => {
    let filters: string[] = [];
    if (query.keywords)   filters.push(`${escape(query.keywords)}`);
    if (query.title)      filters.push(`(title : ${escape(query.title)})`);
    if (query.location)   filters.push(`({ location_short location_full } : ${escape(query.location)})`);
    if (query.locationId) filters.push(`(location_id : ${escape(query.locationId)})`);
    if (query.manager)    filters.push(`(manager_full : ${escape(query.manager)})`);
    if (query.managerId)  filters.push(`(manager_id : ${escape(query.managerId)})`);

    let sql = `SELECT ${columns} from Events WHERE id IN (SELECT id FROM EventsIndex Where EventsIndex MATCH '`
    sql += filters.join(' AND ');
    sql += `' ORDER BY rank)`;
    sql += query.after  ? ` AND (start_time >= $after)` : '';
    sql += query.before ? ` AND (end_time <= $before)` : '';
    sql += query.orderBy === 'newest' ? ' ORDER BY start_time DESC' : query.orderBy === 'oldest' ? ' ORDER BY start_time ASC' : '';
    
    const results = await db.all(
        sql, 
        {
            $after: query.after ? query.after.getTime() : undefined,
            $before: query.before ? query.before.getTime() : undefined
        }
    );

    return results;
}