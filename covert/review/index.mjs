
// import Covert     from './Covert.mjs';
// import Filesystem from './Filesystem.mjs';
import MODULE     from './MODULE.mjs';
// import Network    from './Network.mjs';
// import Renderer   from './Renderer.mjs';
import Results    from './Results.mjs';
import Review     from './Review.mjs';
import Timeline   from './Timeline.mjs';



export default {

	reviews: [

		MODULE,

		// Review and Benchmark
		Review,
		Results,
		Timeline,

		// Covert
		// Covert,
		// Filesystem,
		// Network, // Cannot be tested
		// Renderer

	],

	sources: {

		'ENVIRONMENT': null

	}

};

