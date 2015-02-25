<?php
  set_include_path('partials/');
?>
<!DOCTYPE html>
<html ng-app="gemDealer">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="">
  <meta name="author" content="">
  <title>Gem Dealer</title>
  <link rel="shortcut icon" href="">
  <link rel="stylesheet" href="css/bootstrap.min.css">
  <link rel="stylesheet" href="css/styles.css">
  <script type="text/javascript" src="js/angular.min.js"></script>
  <!--[if IE]>
    <script src="https://cdn.jsdelivr.net/html5shiv/3.7.2/html5shiv.min.js"></script>
    <script src="https://cdn.jsdelivr.net/respond/1.4.2/respond.min.js"></script>
  <![endif]-->
</head>
<body ng-controller="gameController" ng-cloak ng-init="shuffle()">
  <div class="container">
    <div class="row"><h1 class="text-center">Gem Dealer <sup>v0.4</sup></h1></div>
    
    <div class="row game-screen">
      <div class="col-xs-5"><?php include 'buy-menu.html'; ?></div>
      <div class="col-xs-2 text-center center-block" ng-hide="game.day > game.maxDays"><?php include 'middle-menu.html'; ?></div>
      <div class="col-xs-5"><?php include 'sell-menu.html'; ?></div>
    </div>
    
  </div>
  <div class="row">
    <div class="col-xs-8 col-xs-offset-2">
      <?php include 'achievement-list.html'; ?>
    </div>
  </div>
  
  <?php include 'modal.html'; ?>

  <?php include 'achievements.html'; ?>
  
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script>
  <script src="js/angular-bs-ui.js"></script>
  <script src="js/functions.js"></script>
  <script src="js/standard-values.js"></script>
  <script src="js/controllers.js"></script>
  <script src="js/events.js"></script>
  <script>
    $('[title]').attr('data-toggle', 'tooltip').tooltip({container:'body', html:true});
    $('.play-button').click(function(){$(this).addClass('hidden');$('.game-screen').fadeIn()});
    $('tr:nth-child(1n+2)').attr('data-toggle','modal').attr('data-target','#modal');
    $('.modal-footer button').click(function(){$('#modal').modal('hide')});
    $(document).on('click', '.achievement span', function(){
      var obj = $(this).closest('.achievement');
      obj.fadeTo(200, 0, function(){
        obj.slideUp();
      });
    })
  </script>
</body>
</html>






























