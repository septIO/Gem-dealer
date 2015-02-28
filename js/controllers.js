var controllers = [
  'gameController'
]

var app = angular.module('gemDealer', ['ui.bootstrap'])
.controller(controllers);

app.filter('prettyCurrency', function(){
  return function(input){
    if(typeof input === 'undefined') return '';
    if(input == '0') return '';
    return '$ ' + input;
  }
});

app.filter('grantedAchievements', function(){
  return function(input){
    if(input.granted) return true;
    return false;
  }
});

function gameController($scope, $window, $timeout, $filter, $http, $interval){
  //$scope = localStorage.getItem('game') || $scope;
  $scope.initial = angular.copy(window.game);
  $scope.game = $window.game;
  $scope.gems = $window.gems;
  $scope.yesterday = {};
  $scope.achievements = {};
  $scope.stored = 0;
  $scope.Math = $window.Math;
  $scope.amount = 0;
  $scope.granted = atob(window.localStorage.getItem('achievements')).split(',') || ["-1"];
  /*
    The name has been set to '1' to prevent image preload errors.
  */
  
  $scope.selectedGem = {name:'1'};
  
  $scope.$watch('amount', function(){
    $scope.i = parseInt($scope.i);
  });
  
  $scope.$watch('game.money', function(New,old){
    $scope.updateAchievement({
      event : 'money',
      money : 'available',
      amount : 0
    });
    if(New < old){
      $scope.updateAchievement({
      event : 'money',
      money : 'spend',
      amount : parseInt(old-New)
    });
    }
  });
  
  $scope.$watch('game.day', function(New, old){
    var achs = $filter('filter')($scope.achievements, {granted : false, reset : 'daily'});
    angular.forEach(achs, function(ach){
      ach.progress = 0;
    });
    if(game.day == game.maxDays+1){
      var achs = $filter('filter')($scope.achievements, {granted : false, reset : 'game'});
      angular.forEach(achs, function(ach){
        ach.progress = 0;
      });
    }
  });
  
  $scope.$watch('achievements', function(New, old){
    //$scope.updateMetaAchievement();
  }, true);
  
  
  
  $http.get('json/achievements.json')
    .then(function(res){
    
    $scope.achievements = res.data;
    angular.forEach(res.data, function(ach){
      if($scope.granted.indexOf(ach.id.toString()) !== -1){
        ach.granted = true;
        ach.local = true;
        return;
      }
      ach.local = false;
    });
  });
  
  $http.get('json/achievement-categories.json')
    .then(function(res){
    $scope.categories = res.data;
  });
  
  $scope.saveInterval = $interval(function(){
    $scope.save();
  }, 30000);
  
  $scope.save = function(){
    localStorage.setItem('achievements', btoa($scope.granted.join()));
  }
  
  $scope.shuffle = function(){
    $scope.yesterday = angular.copy($scope.gems);
    var gems = $scope.gems;
    var capacity = $scope.game.capacity;
    $.each(gems, function(key, value){
      var g = gems[key];
      // Shuffle prices
      g.price = between(g.values.price.min,g.values.price.max);
      // Shuffle demand
      g.demand = between(82,98);
      // Shuffle quantity
      g.quantity = between(Math.floor(capacity*Math.random()),capacity*1.22); 
      gems[key] = g;
    });
    $scope.gems = gems;
  }
  
  $scope.buyCapacity = function(){
    if($scope.game.money >= $scope.game.storageCost){
      $scope.game.money -= $scope.game.storageCost;
      $scope.game.capacity += 10;
      $scope.game.storageCost = Math.pow($scope.game.storageCost, 1.025);
      $scope.updateAchievement({
        event : 'upgrade',
        upgrade : 'storage',
        amount : 10
      })
    }
  }
  
  $scope.buyDay = function(){
    if($scope.game.money >= $scope.game.dayCost){
      $scope.game.money -= $scope.game.dayCost;
      $scope.game.maxDays += 1;
      $scope.game.dayCost = Math.pow($scope.game.dayCost, 1.025);
    }
  }
  
  $scope.reset = function(){
    $scope.game = $scope.initial;
  }
  
  $scope.setSelectedGem = function(gem){
    $scope.selectedGem = gem;
    $scope.amount = parseInt($scope.maxQuantity(gem));
  }
  
  $scope.setAction = function(action){
    $scope.action = action;
  }
  
  $scope.setEvent = function(){
    var eventArray = ['decrease', 'increase', 'nothing'];
    var r = eventArray[between(0,eventArray.length-1)];
    var e = {};
    if(r!=='nothing'){
      gem = $scope.gems[between(0,gems.length-1)];
      e = events[0][r][between(0,events.length)];
      e.gem = gem;
      gem.demand = parseInt(gem.demand*betweenFloat(e.multiplier.min, e.multiplier.max));
      gem.price = parseInt(gem.price*betweenFloat(e.multiplier.min, e.multiplier.max));
    }
    $scope.event = e;
  }
  
  $scope.buy = function(amount,action){
    if(amount==0) return false;
    g = $scope.game;
    i = $scope.selectedGem;
    gem = $scope.gems[i.name-1];
    pGem = g.inventory['gem'+i.name];
    if(g.money>=i.price*amount && gem.quantity>=amount && action==='Buy'){
      pGem.quantity += parseInt(amount);
      pGem.price = gem.price;
      g.money -= i.price*amount;
      gem.quantity -= amount;
      $scope.stored = updateStoredGems(g.inventory);
    } 
    else if(g.inventory['gem'+i.name].quantity>=amount){
      pGem.quantity -= parseInt(amount);
      if(pGem.quantity == 0) pGem.price = 0;
      g.money += parseInt($scope.calculatePrice(i, amount, 'Sell'));
      gem.quantity += parseInt(amount);
      $scope.stored = updateStoredGems(g.inventory);
      
    }
    $scope.updateAchievement({
      event : action,
      gem : gem.name,
      amount : amount
    });
    
  }
  
  $scope.highLightGem = function(gem){
    g = $scope.game;
    lastGem = $scope.yesterday[gem.name-1];
    // If it's the first or last day, do not highlight
    if(g.day == 1 || g.day > g.maxDays) return;
    if(typeof $scope.event.gem !="undefined" && $scope.event.gem.name == gem.name) return  'bg-info';
    if(gem.price - lastGem.price > 0) return 'bg-success';
    if(gem.price - lastGem.price < 0) return 'bg-danger';
  }
  
  $scope.calculateChange = function(gem){
    g = $scope.game;
    if(g.day == 1 || g.day > g.maxDays) return;
    lastGem = $scope.yesterday[gem.name-1];
    change = Math.round(gem.price / lastGem.price * 100 - 100)
    return (change == 'Infinity' || isNaN(change) ? 0 : change) + ' %'; 
  }
  
  $scope.maxQuantity = function(gem, action){
    g = $scope.game;
    if(action == 'Sell'){
      return g.inventory['gem'+gem.name].quantity;
    } else {
      quantity = 0;
      if(g.money / gem.price >= gem.quantity) quantity = gem.quantity
      if(g.money / gem.price < gem.quantity) quantity = Math.floor(g.money / gem.price);
      if(quantity >= g.capacity - $scope.stored) quantity = g.capacity - $scope.stored;
      return quantity;
    }
  }
  
  $scope.calculatePrice = function(gem, amount, action){
    if(action == 'Sell') return Math.floor((gem.price*(gem.demand/100))*amount);
    if(action == 'Buy') return gem.price*amount;
  }
  
  $scope.updateAchievement = function(event){
    /*
      Only iterate through the achievement that has not
      yet been granted, and where the events matches
    */
    var achs = $filter('filter')($scope.achievements, {granted : false, event : event.event});
    
    angular.forEach(achs, function(ach){
      hasProgress = ach.hasOwnProperty('progress');
      var updated = false;
      if(ach.requirements.hasOwnProperty('gem')){
        if(ach.requirements.gem == 'any' || ach.requirements.gem == event.gem){
          if(event.amount >= ach.requirements.amount) $scope.grantAchievement(ach.id);
          if(hasProgress) {
            ach.progress += parseInt(event.amount);
          }
        }
        /*
          If the achievement has anything to do
          with gems, set the flag to true.
          Prevents achievements to be unlocked when they shouldn't
        */
        updated = true;
      }
      
      if(ach.requirements.hasOwnProperty('money')){
        if(ach.requirements.money === 'available'){
          if($scope.game.money >= ach.requirements.amount) $scope.grantAchievement(ach.id);
        }
      }
      
      if(hasProgress){
        if(!updated) ach.progress += event.amount;
        if(ach.progress >= ach.requirements.amount) $scope.grantAchievement(ach.id);
      }
    })
  }
  
  $scope.updateMetaAchievement = function(){ 
    var achs = $filter('filter')($scope.achievements, {granted : false, event : 'meta'});
    console.log($scope.achievements[1]);
  }
  
  $scope.grantAchievement = function(achievementId){
    achData = $filter('filter')($scope.achievements[achievementId], {id : achievementId});
    achData.granted = true;
    $scope.granted.push(achievementId);
    $scope.save();
  }
  
}