# hyperbolic
Noneuclidean algorithmic music with a 3D browser interface.

### [Start Here (Click)](https://lessstuck.github.io/hyperbolic/)
Sound on! Play with it, and discover how it works.

### The Basic Idea
For each of the 3 objects, there are 3 parameters tied to the 3 dimensions of the object's location. While dragging an object, its sound is soloed to make it easier to hear what's being controlled. Some controls are immediate. For example, moving left/right along the x-axis  pans the sound left/right. Other controls take time to perceive. For example, moving up/down along the y-axis controls rhythmic parameters. The delayed result challenges traditional interactivity design. Does it work?

### Design Goals
Rhythmically precise • 3D physics interface • Musically interesting • Multiplatform

##### Rhythmically precise
I found a simple but accurate [Web Audio metronome](http://andrew-yavtushenko.github.io/metronome/) to drive rhythmic pulses, based on the playback of a silent audio buffer. The .onended property is a callback to restart the loop.

##### 3D physics interface
[Three.js](https://threejs.org/) was the obvious choice for all 3D rendering. Pointer interaction using the [cannon-es.js physics engine](https://github.com/pmndrs/cannon-es) adapted from [this example](https://pmndrs.github.io/cannon-es/examples/threejs_mousepick).

##### Musically interesting
I find that the most interesting musical strucures lie somewhere between completely deterministic and completly random. Stochastic music generators require some form of random to decide among parameter values. By using chaos instead of random, a balance of predictable and unpredictable is perceived. This is achieved with a lookup table of proprietary values generated by [Feigenbaum's recursive quadratic chaos generator](https://sites.google.com/site/poggiolifractalsandchaos/web-diagrams/the-feigenbaum-fractal) and massaged to make for a more even distribution.

In addition, the rhythmic patterns do not follow repeating phrases. This is implemented with my ES module [noneuclidean](https://www.npmjs.com/package/noneuclidean?activeTab=readme), which exports a Track class. Each track receives global play messages on regular beats. The track decides how many beats to count before returning 1, causing the instrument to play its sound, or 0, resulting in no sound. The result is a regular/irregularity I find interesting.

##### Multiplatform
Testing on laptop (Chrome, Safari, Firefox) tablet (Safari), phone (Apple & Android). Your bug reports are most welcome.

### Under the Hood
**index.html** Sets up the interface elements

**app.js** Maps interface elements to js functions, initializes audio context, and instantiates instruments

**mousepick.js** Creates 3D and phyiscs objects. The `pointerdown` event casts a ray to determine if any of the 3 object meshes have been clicked. If so, it defines `hitPoint`, the location of the ray intersection, and `hitBody`, which mesh has been hit. It also creates a `jointBody` with a constraint to the `hitbody`, which `pointermove` events use to drag the clicked object.

As the `jointBody` is moved, it moves the corresponding `hitBody` and updates the mesh position, which is then exported as `dragPositions`, which are used to control the sound parameters of each instrument.

**click.js** Sets up sound presets and plays them. It includes Web Audio nodes for transposition, panning, gain, and bus compression.

The `Sequencer` object controls overall play function. The `Instrument` class includes parameters for `morphWrapper` which functions as a callback from pointer event xyz position, and `trackNumber`, which determines which `preset` and `track` to use. The `Preset` class defines arrays that are the parameters of the instrument.

**noneuclidean.mjs** Defines `Track` class, which counts pulses to decide when a play() call results in a 1 message for the sound to play. At the end of each cycle of pulses, the new cycle length is calculated asynchronously. Track has two parameters. The first, `beatProb`, is an array of probabilites that the cycle length will be index + 1 . The second selects the random function; default is Math.random(), optionally the chaos lookup table, `chaosValues`.

Like most of the world's music, so-called Euclidean rhythms repeat patterns over one or more bars. This algorithm is non-Euclidean in the sense that the overall rhythmic pattern never repeats. The title of the piece continues the wordplay, since a hyperbolic space is non-Euclidean - and it is no hyperbole to suggest this piece will never be finished; completion is asymptotic. 


