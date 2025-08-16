// ==UserScript==
// @name         StreamJVC
// @namespace    http://tampermonkey.net/
// @version      0.2.1
// @description  Essayer d'inclure les streamers Twitch JVC sur une page spéciale
// @author       TrapDesuUwU
// @match        *://www.jeuxvideo.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @connect      twitch.tv
// @grant        GM_xmlhttpRequest
// @require      https://embed.twitch.tv/embed/v1.js
// @downloadURL  https://github.com/TrapDesuUwU/StreamJVC/raw/main/script.user.js
// @updateURL    https://github.com/TrapDesuUwU/StreamJVC/raw/main/script.user.js
// ==/UserScript==

let tentatives = 0;
const streamers = ["trapdesuuwu"];

(function check() {
    streamers.sort();
    const el = document.querySelector('.header__navList.header__navList--platform');
    if (el) {
        createbuttonStream();

    } else if (++tentatives < 6) {
        setTimeout(check, 500);
    }

    if (window.location.href === "https://www.jeuxvideo.com/stream.htm") {
        document.title = "Stream de la communauté JVC";
        const divElement = document.querySelector('.row.my-5.px-3');
        if (divElement) {
            divElement.innerHTML = ''; // Supprime tout le contenu
        }
         divElement.insertAdjacentHTML("beforeend", `<div id="stream-disclaimer">Cette liste est issue d'un script communautaire, ni JVC ni le créateur ou les personnes dans la liste n'ont a assumé les conneries de qui que ce soit d'autres. C'est communautaire</div>`);

        streamers.forEach(username => {
            getStreamInfo(username, info => {
        if (info.live) {
            console.log(`🔴 ${info.username} est en live : ${info.title}]`);

            // Crée un ID unique pour chaque embed
            const embedId = `twitch-embed-${username}`;

            // Ajoute la div d'accueil pour le player Twitch

             divElement.insertAdjacentHTML("beforeend", `<div id="${username}"></div>`);
            const usernameElement = document.querySelector(`#${username}`);
            usernameElement.insertAdjacentHTML("beforeend", `<div id="${embedId}_presentation">${username}</div>`);
             usernameElement.insertAdjacentHTML("beforeend", `<div id="${embedId}"></div>`);

            // Crée le player Twitch
            new Twitch.Embed(embedId, {
                width: 854,
                height: 480,
                channel: username
            });

        } else if (info.error) {
            console.log(`⚠ Impossible de récupérer ${info.username}`);
        } else {
            console.log(`⚫ ${info.username} est hors ligne`);
        }
    });
});
    }

})();


function createbuttonStream() {

    const navGroup = document.querySelector(".header__navList.header__navList--platform");

    //bouton_html
    navGroup.insertAdjacentHTML("beforeend", `
        <li class="header__navItem header__navItem--platform __Stream"><a href="/stream.htm" class="header__navLink header__navLink--platform __Stream">Stream</a></li>
    `);
}



function getStreamInfo(username, callback) {
    GM_xmlhttpRequest({
        method: "GET",
        url: `https://www.twitch.tv/${username}`,
        onload: function(response) {
            const html = response.responseText;
            const isLive = html.includes('property="og:video"');
            if (!isLive) {
                callback({ username, live: false });
                return;
            }

            callback({
                username,
                live: true
            });
        },
        onerror: function() {
            callback({ username, live: false, error: true });
        }
    });
}


