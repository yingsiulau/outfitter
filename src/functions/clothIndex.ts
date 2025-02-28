export function getPullovers() {
  const pulloverPath = "./pullover/";
  const defaultPullovers = [
    { name: "Christmas Sweater", path: `${pulloverPath}Pullover.png` },
    { name: "Knit Sweater", path: `${pulloverPath}Knit.png` },
    { name: "Hässig Hoodie", path: `${pulloverPath}hässig2.png` },
  ];
  const stored = localStorage.getItem("pullovers");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing pullovers from localStorage:", e);
      return defaultPullovers;
    }
  }
  return defaultPullovers;
}

export function addPullover(newPiece: { name: string; path: string }) {
  const pullovers = getPullovers();
  pullovers.push(newPiece);
  localStorage.setItem("pullovers", JSON.stringify(pullovers));
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
  const defaultPants = [
    { name: "Ugly Cargos", path: `${pantsPath}uglyCargo.png` },
    { name: "Blue iets Frans", path: `${pantsPath}ietsFrans.png` },
  ];
  const stored = localStorage.getItem("pants");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing pants from localStorage:", e);
      return defaultPants;
    }
  }
  return defaultPants;
}

export function addPants(newPiece: { name: string; path: string }) {
  const pants = getPants();
  pants.push(newPiece);
  localStorage.setItem("pants", JSON.stringify(pants));
}
