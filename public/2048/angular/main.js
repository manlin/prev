var game = angular.module('game', []);

game.controller('GameCtrl', ['$scope', '$rootScope', '$document', 'gridServ', 'gameServ', function($scope, $rootScope, $document, gridServ, gameServ) {
    $rootScope.score = 0;
    $rootScope.cells = [];
    $rootScope.board = [];
    $rootScope.hasConflicted = [];

    $scope.newgame = function() {
        $rootScope.score = 0;
        $rootScope.board.length = 0;
        $rootScope.hasConflicted.length = 0;

        gridServ.initBoard($rootScope);

        gameServ.generateOneNumber();
        gameServ.generateOneNumber();        
    };

    gridServ.initCells($rootScope);
    gridServ.initBoard($rootScope);

    $document.bind('keydown', function(event) {
        event.preventDefault();

        switch( event.keyCode ){
            case 37: //left
                console.log('Key Left');
                if( gridServ.moveLeft($rootScope) ){
                    gameServ.generateOneNumber();
                    gridServ.isgameover($rootScope.board);
                }
                break;
            case 38: //up
                console.log('Key Up');
                if( gridServ.moveUp($rootScope) ){
                    gameServ.generateOneNumber();
                    gridServ.isgameover($rootScope.board);
                }
                break;
            case 39: //right
                console.log('Key Right');
                //gameServ.generateOneNumber();
                if( gridServ.moveRight($rootScope) ){
                    gameServ.generateOneNumber();
                    gridServ.isgameover($rootScope.board);
                }
                break;
            case 40: //down
                console.log('Key Down');
                //gameServ.generateOneNumber();
                if( gridServ.moveDown($rootScope) ){
                    gameServ.generateOneNumber();
                    gridServ.isgameover($rootScope.board);
                }
                break;
            default: //default
                break;
        }
    });

    gameServ.generateOneNumber();
    gameServ.generateOneNumber();
}]);

game.service('gridServ', function() {
    this.initCells = function($rootScope) {
        for(var i = 0; i < 4; i++) {
            for(var j = 0; j < 4; j++) {        
                $rootScope.cells.push({
                    row: i,
                    column: j,
                    style: {
                        top: this.top(i, j) + 'px',
                        left: this.left(i, j) + 'px'
                    }
                });
            }
        }
    };

    this.initBoard = function($rootScope) {
        for(var i = 0; i < 4; i++) {
            for(var j = 0; j < 4; j++) {        
                $rootScope.board.push({
                    row: i,
                    column: j,
                    data: 0,
                    style: {
                        height: '0px',
                        width: '0px',
                        top: (this.top(i, j) + 50) + 'px',
                        left: (this.left(i, j) + 50) + 'px',
                        fontSize: '20px'
                    }
                });
            }
        }
    };

    this.top = function(row, column) {
        return 20 + row * 120;
    };

    this.left = function(row, column) {
        return 20 + column * 120;
    };

    this.getNumberBackgroundColor = function ( number ){
        switch( number ){
            case 2:return "#eee4da";break;
            case 4:return "#ede0c8";break;
            case 8:return "#f2b179";break;
            case 16:return "#f59563";break;
            case 32:return "#f67c5f";break;
            case 64:return "#f65e3b";break;
            case 128:return "#edcf72";break;
            case 256:return "#edcc61";break;
            case 512:return "#9c0";break;
            case 1024:return "#33b5e5";break;
            case 2048:return "#09c";break;
            case 4096:return "#a6c";break;
            case 8192:return "#93c";break;
        }

        //return "black";
        return null;
    };

    this.getNumberColor = function ( number ){
        if( number <= 4 )
            return "#776e65";

        return "white";
    };

    this.nospace = function ( board ){
        for( var i = 0 ; i < 4 ; i ++ )
            for( var j = 0 ; j < 4 ; j ++ )
                if( board[i * 4 + j].data == 0 )
                    return false;

        return true;
    };

    this.canMoveUp = function( board ) {
        for( var j = 0 ; j < 4 ; j ++ )
            for( var i = 1 ; i < 4 ; i ++ )
                if( board[i * 4 + j].data != 0 )
                    if( board[(i-1) * 4 + j].data == 0 || board[(i-1) * 4 + j].data == board[i * 4 + j].data )
                        return true;

        return false;
    };

    this.canMoveDown = function( board ){
        for( var j = 0 ; j < 4 ; j ++ )
            for( var i = 2 ; i >= 0 ; i -- )
                if( board[i * 4 + j].data != 0 )
                    if( board[(i+1) * 4 + j].data == 0 || board[(i+1) * 4 + j].data == board[i * 4 + j].data )
                        return true;

        return false;
    };

    this.canMoveLeft = function( board ){
        for( var i = 0 ; i < 4 ; i ++ )
            for( var j = 1; j < 4 ; j ++ )
                if( board[i * 4 + j].data != 0 )
                    if( board[i * 4 + j-1].data == 0 || board[i * 4 + j -1].data == board[i * 4 + j].data )
                        return true;

        return false;
    };

    this.canMoveRight = function( board ){
        for( var i = 0 ; i < 4 ; i ++ )
            for( var j = 2; j >= 0 ; j -- )
                if( board[i * 4 + j].data != 0 )
                    if( board[i * 4 + j + 1].data == 0 || board[i * 4 + j +1].data == board[i * 4 + j].data )
                        return true;

        return false;
    };

    this.noBlockHorizontal = function( row , col1 , col2 , board ){
        for( var i = col1 + 1 ; i < col2 ; i ++ )
            if( board[row * 4 + i].data != 0 )
                return false;
        return true;
    };

    this.noBlockVertical = function( col , row1 , row2 , board ){
        for( var i = row1 + 1 ; i < row2 ; i ++ )
            if( board[i * 4 + col].data != 0 )
                return false;
        return true;
    };

    this.moveUp = function( $rootScope ) {
        var board = $rootScope.board;
        if( !this.canMoveUp( board ) )
            return false;

        //moveUp
        for( var j = 0 ; j < 4 ; j ++ )
            for( var i = 1 ; i < 4 ; i ++ ){
                if( board[i * 4 + j].data != 0 ){
                    for( var k = 0 ; k < i ; k ++ ){

                        if( board[k * 4 + j].data == 0 && this.noBlockVertical( j , k , i , board ) ){
                            //move
                            board[k * 4 + j].data = board[i * 4 + j].data;
                            board[i * 4 + j].data = 0;
                            $rootScope.board[i * 4 + j].style.height = '0px';
                            $rootScope.board[i * 4 + j].style.width = '0px';

                            $rootScope.board[k * 4 + j].style.height = '100px';
                            $rootScope.board[k * 4 + j].style.width = '100px';
                            $rootScope.board[k * 4 + j].style.top = this.top(k, j) + 'px';
                            $rootScope.board[k * 4 + j].style.left = this.left(k, j) + 'px';
                            $rootScope.board[k * 4 + j].style.backgroundColor = this.getNumberBackgroundColor(board[k * 4 + j].data);
                            $rootScope.board[k * 4 + j].style.color = this.getNumberColor(board[k * 4 + j].data);

                            continue;
                        }
                        else if( board[k * 4 + j].data == board[i * 4 + j].data && this.noBlockVertical( j , k , i , board ) && !$rootScope.hasConflicted[k * 4 + j] ){
                            //move
                            //add
                            board[k * 4 + j].data += board[i * 4 + j].data;
                            board[i * 4 + j].data = 0;
                            //add score
                            $rootScope.score += board[k * 4 + j].data;

                            $rootScope.board[i * 4 + j].style.height = '0px';
                            $rootScope.board[i * 4 + j].style.width = '0px';                            
                            
                            $rootScope.board[k * 4 + j].style.height = '100px';
                            $rootScope.board[k * 4 + j].style.width = '100px';
                            $rootScope.board[k * 4 + j].style.top = this.top(k, j) + 'px';
                            $rootScope.board[k * 4 + j].style.left = this.left(k, j) + 'px';
                            $rootScope.board[k * 4 + j].style.backgroundColor = this.getNumberBackgroundColor(board[k * 4 + j].data);
                            $rootScope.board[k * 4 + j].style.color = this.getNumberColor(board[k * 4 + j].data);                  

                            $rootScope.hasConflicted[k * 4 + j] = true;
                            continue;
                        }

                    }
                }
            }

        $rootScope.hasConflicted.length = 0;
        if(!$rootScope.$$phase) {
            $rootScope.$apply();
        }

        return true;
    };

    this.moveDown = function($rootScope) {
        var board = $rootScope.board;
        if( !this.canMoveDown( board ) )
            return false;

        //moveDown
        for( var j = 0 ; j < 4 ; j ++ )
            for( var i = 2 ; i >= 0 ; i -- ){
                if( board[i*4 +j].data != 0 ){
                    for( var k = 3 ; k > i ; k -- ){

                        if( board[k*4 + j].data == 0 && this.noBlockVertical( j , i , k , board ) ){
                            //move
                            board[k*4+j].data = board[i*4+j].data;
                            board[i*4+j].data = 0;

                            $rootScope.board[i * 4 + j].style.height = '0px';
                            $rootScope.board[i * 4 + j].style.width = '0px';                            
                            
                            $rootScope.board[k * 4 + j].style.height = '100px';
                            $rootScope.board[k * 4 + j].style.width = '100px';
                            $rootScope.board[k * 4 + j].style.top = this.top(k, j) + 'px';
                            $rootScope.board[k * 4 + j].style.left = this.left(k, j) + 'px';
                            $rootScope.board[k * 4 + j].style.backgroundColor = this.getNumberBackgroundColor(board[k * 4 + j].data);
                            $rootScope.board[k * 4 + j].style.color = this.getNumberColor(board[k * 4 + j].data);                  

                            continue;
                        }
                        else if( board[k*4+j].data == board[i*4+j].data && this.noBlockVertical( j , i , k , board ) && !$rootScope.hasConflicted[k*4+j] ){
                            //move
                            //add
                            board[k*4+j].data += board[i*4+j].data;
                            board[i*4+j].data = 0;
                            //add score
                            $rootScope.score += board[k*4+j].data;

                            $rootScope.board[i * 4 + j].style.height = '0px';
                            $rootScope.board[i * 4 + j].style.width = '0px';                            
                            
                            $rootScope.board[k * 4 + j].style.height = '100px';
                            $rootScope.board[k * 4 + j].style.width = '100px';
                            $rootScope.board[k * 4 + j].style.top = this.top(k, j) + 'px';
                            $rootScope.board[k * 4 + j].style.left = this.left(k, j) + 'px';
                            $rootScope.board[k * 4 + j].style.backgroundColor = this.getNumberBackgroundColor(board[k * 4 + j].data);
                            $rootScope.board[k * 4 + j].style.color = this.getNumberColor(board[k * 4 + j].data);                  


                            $rootScope.hasConflicted[k*4+j] = true;
                            continue;
                        }
                    }
                }
            }

        $rootScope.hasConflicted.length = 0;
        if(!$rootScope.$$phase) {
            $rootScope.$apply();
        }        
        return true;
    };

    this.moveLeft = function($rootScope) {
        var board = $rootScope.board;
        if( !this.canMoveLeft( board ) )
            return false;

        //moveLeft
        for( var i = 0 ; i < 4 ; i ++ )
            for( var j = 1 ; j < 4 ; j ++ ){
                if( board[i*4+j].data != 0 ){

                    for( var k = 0 ; k < j ; k ++ ){
                        if( board[i*4+k].data == 0 && this.noBlockHorizontal( i , k , j , board ) ){
                            //move
                            board[i*4+k].data = board[i*4+j].data;
                            board[i*4+j].data = 0;

                            $rootScope.board[i * 4 + j].style.height = '0px';
                            $rootScope.board[i * 4 + j].style.width = '0px';                            
                            
                            $rootScope.board[i * 4 + k].style.height = '100px';
                            $rootScope.board[i * 4 + k].style.width = '100px';
                            $rootScope.board[i * 4 + k].style.top = this.top(i, k) + 'px';
                            $rootScope.board[i * 4 + k].style.left = this.left(i, k) + 'px';
                            $rootScope.board[i * 4 + k].style.backgroundColor = this.getNumberBackgroundColor(board[i * 4 + k].data);
                            $rootScope.board[i * 4 + k].style.color = this.getNumberColor(board[i * 4 + k].data);                  

                            continue;
                        }
                        else if( board[i*4+k].data == board[i*4+j].data && this.noBlockHorizontal( i , k , j , board ) && !$rootScope.hasConflicted[i*4+k] ){
                            //move
                            //add
                            board[i*4+k].data += board[i*4+j].data;
                            board[i*4+j].data = 0;
                            //add score
                            $rootScope.score += board[i*4+k].data;
                            //updateScore( score );

                            $rootScope.board[i * 4 + j].style.height = '0px';
                            $rootScope.board[i * 4 + j].style.width = '0px';                            
                            
                            $rootScope.board[i * 4 + k].style.height = '100px';
                            $rootScope.board[i * 4 + k].style.width = '100px';
                            $rootScope.board[i * 4 + k].style.top = this.top(i, k) + 'px';
                            $rootScope.board[i * 4 + k].style.left = this.left(i, k) + 'px';
                            $rootScope.board[i * 4 + k].style.backgroundColor = this.getNumberBackgroundColor(board[i * 4 + k].data);
                            $rootScope.board[i * 4 + k].style.color = this.getNumberColor(board[i * 4 + k].data);                  


                            $rootScope.hasConflicted[i*4+k] = true;
                            continue;
                        }
                    }
                }
            }

        $rootScope.hasConflicted.length = 0;
        if(!$rootScope.$$phase) {
            $rootScope.$apply();
        }         
        return true;
    };

    this.moveRight = function($rootScope) {
        var board = $rootScope.board;
        if( !this.canMoveRight( board ) )
            return false;

        //moveRight
        for( var i = 0 ; i < 4 ; i ++ )
            for( var j = 2 ; j >= 0 ; j -- ){
                if( board[i*4+j].data != 0 ){
                    for( var k = 3 ; k > j ; k -- ){

                        if( board[i*4+k].data == 0 && this.noBlockHorizontal( i , j , k , board ) ){
                            //move
                            board[i*4+k].data = board[i*4+j].data;
                            board[i*4+j].data = 0;

                            $rootScope.board[i * 4 + j].style.height = '0px';
                            $rootScope.board[i * 4 + j].style.width = '0px';                            
                            
                            $rootScope.board[i * 4 + k].style.height = '100px';
                            $rootScope.board[i * 4 + k].style.width = '100px';
                            $rootScope.board[i * 4 + k].style.top = this.top(i, k) + 'px';
                            $rootScope.board[i * 4 + k].style.left = this.left(i, k) + 'px';
                            $rootScope.board[i * 4 + k].style.backgroundColor = this.getNumberBackgroundColor(board[i * 4 + k].data);
                            $rootScope.board[i * 4 + k].style.color = this.getNumberColor(board[i * 4 + k].data);                  

                            continue;
                        }
                        else if( board[i*4+k].data == board[i*4+j].data && this.noBlockHorizontal( i , j , k , board ) && !$rootScope.hasConflicted[i*4+k] ){
                            //add
                            board[i*4+k].data += board[i*4+j].data;
                            board[i*4+j].data = 0;
                            //add score
                            $rootScope.score += board[i*4+k].data;
                            //updateScore( score );
                            $rootScope.board[i * 4 + j].style.height = '0px';
                            $rootScope.board[i * 4 + j].style.width = '0px';                            
                            
                            $rootScope.board[i * 4 + k].style.height = '100px';
                            $rootScope.board[i * 4 + k].style.width = '100px';
                            $rootScope.board[i * 4 + k].style.top = this.top(i, k) + 'px';
                            $rootScope.board[i * 4 + k].style.left = this.left(i, k) + 'px';
                            $rootScope.board[i * 4 + k].style.backgroundColor = this.getNumberBackgroundColor(board[i * 4 + k].data);
                            $rootScope.board[i * 4 + k].style.color = this.getNumberColor(board[i * 4 + k].data);                  


                            $rootScope.hasConflicted[i*4+k] = true;
                            continue;
                        }
                    }
                }
            }

        $rootScope.hasConflicted.length = 0;
        if(!$rootScope.$$phase) {
            $rootScope.$apply();
        }         
        return true;
    };

    this.isgameover = function( board ) {
        if( this.nospace( board ) && this.nomove( board ) ){
            this.gameover();
        }
    };



    this.nomove = function( board ){
        if( this.canMoveLeft( board ) ||
            this.canMoveRight( board ) ||
            this.canMoveUp( board ) ||
            this.canMoveDown( board ) )
            return false;

        return true;
    };

    this.gameover = function() {
        alert('Game Over!');
    };
});

game.service('gameServ', ['$document', '$rootScope', '$timeout', 'gridServ', function($document, $rootScope, $timeout, gridServ) {
    this.generateOneNumber = function(board) {
        console.log('>>> in generateOneNumber');
        //console.log(board);
        if( gridServ.nospace( $rootScope.board ) ) {
            return false;
        }

        //随机一个位置
        var randx = Math.floor( Math.random()  * 4 );
        var randy = Math.floor( Math.random()  * 4 );

        var times = 0;
        while( times < 50 ){
            if( $rootScope.board[randx * 4 + randy].data == 0 )
                break;

            randx = parseInt( Math.floor( Math.random()  * 4 ) );
            randy = parseInt( Math.floor( Math.random()  * 4 ) );

            times ++;
        }
        if( times == 50 ){
            for( var i = 0 ; i < 4 ; i ++ )
                for( var j = 0 ; j < 4 ; j ++ ){
                    if( $rootScope.board[i * 4 + j].data == 0 ){
                        randx = i;
                        randy = j;
                    }
                }
        }

        //随机一个数字
        var randNumber = Math.random() < 0.5 ? 2 : 4;

        //在随机位置显示随机数字
        $rootScope.board[randx * 4 + randy].data = randNumber;
        $rootScope.board[randx * 4 + randy].style.height = '100px';
        $rootScope.board[randx * 4 + randy].style.width = '100px';
        $rootScope.board[randx * 4 + randy].style.top = gridServ.top(randx, randy) + 'px';
        $rootScope.board[randx * 4 + randy].style.left = gridServ.left(randx, randy) + 'px';
        $rootScope.board[randx * 4 + randy].style.backgroundColor = gridServ.getNumberBackgroundColor(randNumber);
        $rootScope.board[randx * 4 + randy].style.color = gridServ.getNumberColor(randNumber);

        if(!$rootScope.$$phase) {
            $rootScope.$apply();
        }

        return true;
    };
}]);

game.filter('shownum', function() {
    return function(data) {
        return data > 0 ? data : '';
    };
});