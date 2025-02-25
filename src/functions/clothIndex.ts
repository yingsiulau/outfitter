export function getPullovers() {
    const pulloverPath = "./pullover/";
  
    return [
      { name: "Christmas Sweater", path: `${pulloverPath}Pullover.png` },
      { name: "Knit Sweater", path: `${pulloverPath}Knit.png` },
      { name: "Hässig Hoodie", path: `${pulloverPath}hässig2.png` },
    ];
  }
  
  export function getShoes() {
    const shoesPath = "./shoes/";
  
    return [
      { name: "Black Tns", path: `${shoesPath}schüeli.png` },
      { name: "Shox", path: `${shoesPath}shox.png` },
    ];
  }

  export function getPants() {
    const pantsPath = "./pants/";
  
    return [
      { name: "Ugly Cargos", path: `${pantsPath}uglyCargo.png` },
      { name: "Blue iets Frans", path: `${pantsPath}ietsFrans.png` },
    ];
  }
  