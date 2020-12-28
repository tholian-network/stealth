
import fs      from 'fs';
import process from 'process';


let REPORT = Array.from(process.argv).slice(2).find((v) => v.startsWith('.github')) || null;
if (REPORT !== null) {

	let buffer = fs.readFileSync(REPORT, 'utf8');
	if (buffer !== null) {

		let failed = false;

		buffer.split('\n').forEach((line) => {

			if (line.includes('>') === false) {

				if (line.startsWith('(!)') && line.trim() !== '(!)') {
					console.log(line);
					failed = true;
				} else if (line.startsWith('(?)') && line.trim() !== '(?)') {
					console.log(line);
					failed = true;
				}

			}

		});

		if (failed === true) {
			process.exit(1);
		} else {
			process.exit(0);
		}

	}

} else {
	process.exit(1);
}

