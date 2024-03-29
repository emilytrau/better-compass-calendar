"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("../db/schema/user");
/** A list of all managers */
let managers;
user_1.getManagers().then(x => managers = x);
/**
 * Validate and parse an inputted date
 */
const parseDate = (dateString) => {
    try {
        const [year, month, date] = dateString.split('-');
        return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(date, 10));
    }
    catch (error) {
        return null;
    }
};
/**
 * Validate and parse a user defined filter into a query
 */
const filterToQuery = (filter, userId) => {
    // Split the filter into tokens
    const tokens = filter.trim()
        .split(' ')
        .map((word) => {
        const token = word.split(':');
        // Special case for the  "subscribed" token
        // It does not have a parameter
        if (token[0] === 'subscribed') {
            return {
                type: 'subscribed',
                data: ''
            };
        }
        // If a token does not have a parameter, treat it as a keyword
        if (!token[1]) {
            return {
                type: 'keyword',
                data: token[0]
            };
        }
        // Parse each of the different token types
        const date = parseDate(token[1]);
        switch (token[0]) {
            case 'before':
                return {
                    type: date ? 'before' : 'keyword',
                    data: date || word
                };
            case 'after':
                return {
                    type: date ? 'after' : 'keyword',
                    data: date || word
                };
            case 'during':
                return {
                    type: date ? 'during' : 'keyword',
                    data: date || word
                };
            case 'title':
                return {
                    type: 'title',
                    data: token[1]
                };
            case 'teacher':
                return {
                    type: 'managerid',
                    data: managers.find(x => x.displayCode === token[1]).id
                };
            case 'room':
                return {
                    type: 'location',
                    data: token[1]
                };
            default:
                return {
                    type: 'keyword',
                    data: word
                };
        }
    });
    const keywords = [];
    let title;
    let location;
    let managerId;
    let after;
    let before;
    let subscribedUserId;
    // Iterate through the tokens and find the intersection of all of them
    tokens.forEach((token) => {
        switch (token.type) {
            case 'keyword':
                keywords.push(token.data);
                break;
            case 'title':
                title = token.data;
                break;
            case 'location':
                location = token.data;
                break;
            case 'managerid':
                managerId = token.data;
                break;
            case 'before':
                if (!before || token.data < before) {
                    before = token.data;
                }
                break;
            case 'after':
                if (!after || token.data > after) {
                    after = token.data;
                }
                break;
            case 'during':
                if (!before || token.data < before) {
                    before = token.data;
                }
                if (!after || token.data > after) {
                    after = token.data;
                }
                break;
            case 'subscribed':
                subscribedUserId = userId;
                break;
            default:
                break;
        }
    });
    // Return the intersection of all tokens as a query
    return {
        keywords,
        title,
        location,
        managerId,
        after,
        before,
        subscribedUserId
    };
};
exports.default = filterToQuery;
//# sourceMappingURL=filterToQuery.js.map