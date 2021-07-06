const core = require('@actions/core');
const github = require('@actions/github');

const analysis = require('../src/analysis.js');
const webhook = require('../src/discord.js');
https://discord.com/api/webhooks/775469717153513472/vkc8qka9AJ8suTqN4hAJvSB855yHAbA1Pzx0dyDjVLa62HSM--7y5aVWli9NDzzwqrFh
async function run() {
	const payload = github.context.payload;
	const repository = payload.repository.full_name;
	const commits = payload.commits;
	const size = commits.length;
	const branch = payload.ref.split('/')[payload.ref.split('/').length - 1];

	console.log(`Received payload ${JSON.stringify(payload, null, 2)}`);
	console.log(`Received ${commits.length}/${size} commits...`);

	if (commits.length === 0) {
        // This was likely a "--tags" push.
        console.log(`Aborting analysis, found no commits.`);
		return;
	}

	const webhookUrl = core.getInput("webhook_url").split('/');

	if (!!webhookUrl) {
		const id = webhookUrl[5];
    	const token = webhookUrl[6];
	} else {
		const id = core.getInput("id");
    	const token = core.getInput("token");
	}

	const links = !!core.getInput("links") ? core.getInput("links") : false;

	analysis.start(isSkipped(payload.head_commit)).then((report) => {
        webhook.send(id, token, repository, branch, payload.compare, commits, size, report, links).catch(err => core.setFailed(err.message));
    }, err => core.setFailed(err));
}

try {
	run();
} catch (error) {
    core.setFailed(error.message);
}

function isSkipped(commit) {
	return commit.message.toLowerCase().includes("[skip]");
}
