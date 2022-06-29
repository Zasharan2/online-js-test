// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-auth.js";
import { getDatabase, ref, set, onDisconnect, onValue, onChildAdded, onChildRemoved } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBW2nLorN1eNs4zsZbe_ukFi4ayyjXXCtU",
  authDomain: "project1-1e494.firebaseapp.com",
  databaseURL: "https://project1-1e494-default-rtdb.firebaseio.com",
  projectId: "project1-1e494",
  storageBucket: "project1-1e494.appspot.com",
  messagingSenderId: "30600835592",
  appId: "1:30600835592:web:69c11417f16ba442da57bd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

var c = document.getElementById("gameCanvas");
var ctx = c.getContext("2d");

var ss = document.getElementById("spritesheet");

window.addEventListener("keydown", keyPressed, false);
window.addEventListener("keyup", keyReleased, false);

var keys = [];

function keyPressed(event){
    keys[event.keyCode] = true;
}

function keyReleased(event){
    keys[event.keyCode] = false;
}

var mX;
var mY;

window.addEventListener("mousemove", function(evt) {
    mX = evt.clientX - c.getBoundingClientRect().left;
    mY = evt.clientY - c.getBoundingClientRect().top;
});

var mouseDown;

window.addEventListener("mousedown", function(){
    mouseDown = true;
});

window.addEventListener("mouseup", function(){
    mouseDown = false;
});

class Player {
    constructor(name, x, y, self) {
        // string
        this.name = name;

        // int
        this.x = x;
        this.y = y;

        // bool
        this.self = self
    }
};

var gamePlayers = {};
var gamePlayer;

var playerID;
var playerRef;

var allPlayersRef;

function main() {
    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 512, 512);

    for (var key in gamePlayers) {
        if (gamePlayers[key].self == false) {
            // draw grey
            ctx.drawImage(ss, 16, 0, 16, 16, gamePlayers[key].x, gamePlayers[key].y, 16, 16);
        }
    }

    // draw green
    ctx.drawImage(ss, 0, 0, 16, 16, gamePlayer.x, gamePlayer.y, 16, 16);

    if (keys[65]) {
        gamePlayer.x -= 1;
        set(playerRef, {
            id: playerID,
            name: gamePlayer.name,
            x: gamePlayer.x,
            y: gamePlayer.y
        });
    }
    if (keys[68]) {
        gamePlayer.x += 1;
        set(playerRef, {
            id: playerID,
            name: gamePlayer.name,
            x: gamePlayer.x,
            y: gamePlayer.y
        });
    }
    if (keys[83]) {
        gamePlayer.y += 1;
        set(playerRef, {
            id: playerID,
            name: gamePlayer.name,
            x: gamePlayer.x,
            y: gamePlayer.y
        });
    }
    if (keys[87]) {
        gamePlayer.y -= 1;
        set(playerRef, {
            id: playerID,
            name: gamePlayer.name,
            x: gamePlayer.x,
            y: gamePlayer.y
        });
    }

    window.requestAnimationFrame(main);
}

function initGame() {
    allPlayersRef = ref(database, `players`);

    // callback will occur whenever player ref changes
    onValue(allPlayersRef, (snapshot) => {
        for (var key in (snapshot.val() || {})) {
            gamePlayers[key].name = snapshot.val()[key].name;
            gamePlayers[key].x = snapshot.val()[key].x;
            gamePlayers[key].y = snapshot.val()[key].y;
        }
    });

    // callback will occur whenever (relative to the client) a new player joins
    // (this means even if people were playing before a new client joins, to the client the other people will have just joined and this function will fire for all of them)
    onChildAdded(allPlayersRef, (snapshot) => {
        var addedPlayer = snapshot.val();

        if (addedPlayer.id === playerID) {
            gamePlayer = new Player(addedPlayer.name, addedPlayer.x, addedPlayer.y, true);
            gamePlayers[addedPlayer.id] = gamePlayer;
        } else {
            var p = new Player(addedPlayer.name, addedPlayer.x, addedPlayer.y, false);
            gamePlayers[addedPlayer.id] = p;
        }
    });

    onChildRemoved(allPlayersRef, (snapshot) => {
        delete(gamePlayers[snapshot.val().id]);
    })
    
    window.requestAnimationFrame(main);
}

function init() {

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // logged in
            playerID = user.uid;
            // players node does not exist yet but firing of this will create the node as well as populate it with the player id
            // after the players node is created, all other player ids will be populated into the existing player node
            playerRef = ref(database, `players/${playerID}`);

            set(playerRef, {
                id: playerID,
                name: "danny phantom",
                x: 20,
                y: 20
            });

            onDisconnect(playerRef).remove();

            initGame();
        } else {
            // logged out
        }
    });

    signInAnonymously(auth).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        
        console.log(errorCode, errorMessage);
    });
}

init();