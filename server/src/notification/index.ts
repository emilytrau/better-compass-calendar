import push = require('./../push');
import subscriptions = require('./../subscriptions');
import location = require('./../location');
import user = require('./../user');
import config = require('./../../config');
import { Event } from '../db/schema/event';
import { URL } from 'url';

/**
 * Send out notifications that an event has changed
 * @param event 
 */
export const notifyEventUpdate = async (event: Event) => {
    // Format date and times as strings
    const date = event.startTime.toLocaleString('en-au', { day: '2-digit', month: 'long' });
    const startTime = event.startTime.toLocaleString('en-au', { hour: '2-digit', minute: '2-digit' });
    const endTime = event.endTime.toLocaleString('en-au', { hour: '2-digit', minute: '2-digit' });
    // Get location and manager
    const l = await location.getLocation(event.locationId || 0);
    const m = await user.getDetails(event.managerId);

    // Construct the push payload
    const pushMessage = {
        title: 'Event updated: ' + event.title,
        body: `${date} ${startTime} – ${endTime}\n${l.shortName} – ${m.fullName}`,
        url: new URL('/e/' + event.id, config.hostname).href
    }

    // Send a push notification to each subscribed user sequentially
    const promiseChain = Promise.resolve();
    const users = await subscriptions.getSubscribedUsers({ id: event.activityId });
    users.forEach((user) => {
        promiseChain.then(() => push.pushMessage(user, pushMessage));
    });
    await promiseChain;
}