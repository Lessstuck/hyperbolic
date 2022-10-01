let pussy = {type: "lion"};
// console.log("pussy", pussy)
let cat = Object.create(pussy);
// console.log("created cat", cat)
// console.log("called cat", cat.type)
cat.size = "large"
console.log("enlarged cat", cat)

let copyCat = cat
console.log("answer assign", copyCat.type, copyCat.size);

copyCat = {...cat}
console.log("copyCat destructure", copyCat.type, copyCat.size)

copyCat = Object.create(cat)
console.log("answer create", copyCat.type, copyCat.size);
// cat.type = "tiger";




// console.log("cat", cat)
// console.log("copyCat", copyCat)
// console.log("cat proto", Object.getPrototypeOf(cat))
// console.log("copy proto", Object.getPrototypeOf(copyCat))


// let person = {
//     isHuman: false,
//     printIntroduction: function() {
//       console.log(`My name is ${this.name}. Am I human? ${this.isHuman}`);
//     }
//   };
//   console.log("person", person)
//   const me = Object.create(person);
//   console.log("me", me)
  
//   me.name = 'Matthew'; // "name" is a property set on "me", but not on "person"
//   me.isHuman = true; // inherited properties can be overwritten
//   console.log("me me", me)
//   me.printIntroduction();
  // expected output: "My name is Matthew. Am I human? true"
  