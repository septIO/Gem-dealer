function between(min,max){
  return Math.floor(Math.random()*(max-min+1)+min);
}

function betweenFloat(min, max){
  return Math.random()*(max-min)+min;
}

function shuffleGems(){
  var gems = window.gems;
  var capacity = 10;
  $.each(window.gems, function(key, value){
    var g = gems[key];
    // Shuffle prices
    g.price = between(g.values.price.min,g.values.price.max);
    // Shuffle demand
    g.demand = between(82,98);
    // Shuffle quantity
    g.quantity = between(Math.floor(capacity*Math.random()),capacity*1.22); 
    gems[key] = g;
  });
  return gems;
}

function sumObject(object, property){
  var total = 0;
  for (var key in object){
    total = object[property];
  }
  console.log(object);
  return total;
}

function updateStoredGems(gems){
  var total = 0;
  $.each(gems, function(k, v){
    total += v.quantity;
  });
  return total;
}