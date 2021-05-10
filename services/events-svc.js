const { Events, Users } = require("../models/schema");
const { Op } = require("sequelize");
const { UTCtoIST } = require("../utils");

const onPageLimit = 6;

async function getEventsSvc(pageNumber = 0, type = "all", time = "all") {
	let TodayDate = new Date();
	TodayDate = UTCtoIST(TodayDate);

	let events = await Events.findAll({
		attributes: [
			"title",
			"description",
			"id",
			"startTime",
			"endTime",
			"venue",
			"type",
			"mainImgUrl",
		],
		order: ["startTime"],
		where: {
			type:
				type === "all" ? { [Op.or]: ["hack", "webinar", "workshop"] } : type,
			endTime: time === "past" ? { [Op.lt]: TodayDate } : { [Op.not]: null },
			startTime:
				time === "upcomming" ? { [Op.gt]: TodayDate } : { [Op.not]: null },
		},
		offset: pageNumber * onPageLimit,
		limit: onPageLimit,
	});

	return events;
}

async function getEventByIdSvc(id) {
	let event = await Events.findOne({
		where: {
			id: id,
		},
	});
	return event;
}

async function createEventSvc(data) {
	console.log(data);
	let event = await Events.create({ ...data });
	if (event) {
		return event.id;
	} else {
		throw new Error("Unexpected Error");
	}
}

async function registerUserForEventSvc(userId, eventId) {
	let event = await Events.findOne({
		where: {
			id: eventId,
		},
	});

	if (!event) {
		throw new Error("Event Not Found");
	}

	event.registeredUsersId.push(userId);
	event.save();

	return { success: "Registered" };
}

module.exports = {
	getEventsSvc,
	getEventByIdSvc,
	createEventSvc,
	registerUserForEventSvc,
};
