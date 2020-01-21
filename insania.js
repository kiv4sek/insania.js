// ==UserScript==
// @name         Heroes on Discord
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Quickly send discord messages for heroes and titans
// @author       Kris Aphalon
// @match        http://*.margonem.pl/
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function ()
{
    let settings = {
        webhookUrl: "https://discordapp.com/api/webhooks/651153267300106282/adG4grml5DsoaxNvY3I-vT44leTYAYZVleRGJvklToDrB84o5QjYWu8JS3z3-WBp-qI9",
        name: ""
    }

    function loadSettings()
    {
        const savedSettings = localStorage.getItem("heroes-discord")
        if (savedSettings)
        {
            settings = JSON.parse(savedSettings)
        }
    }

    const css = '.heroes-discord__popup{border-image:url("http://tempest.margonem.pl/img/gui/tmp/window-frame.png") 32 20 repeat;border-style:solid;border-width:10px 5px;color:black;left:calc(50% - 150px);position:fixed;top:20px;width:300px;z-index:1000}.heroes-discord__background{background-image:url("http://tempest.margonem.pl/img/gui/content-redleather.jpg");height:auto}.heroes-discord__img{display:flex;justify-content:center;padding-top:10px}.heroes-discord__text{margin-bottom:5px;margin-top:10px;text-align:center}.heroes-discord__buttons-container{align-content:center;border-top:2px solid #3d291c;display:flex;height:37px;justify-content:space-evenly;margin:0 -2px;padding-top:3px}.heroes-discord__button{background-color:#000;background-image:linear-gradient(to top, #12210d, #396b29);border:solid 1px #0c0d0d;border-radius:6px;box-shadow:inset 0 0 1px 1px #cecece, inset 0 0 0 3px #0c0d0d;box-sizing:border-box;color:#e6d6bf;cursor:pointer;display:inline-block;height:32px;line-height:normal;padding:0;position:relative;width:100px}.heroes-discord__button:hover{background-image:linear-gradient(to top, #101010, #434343)}.heroes-discord__button:active{background-image:linear-gradient(to top, #58310b, #b26417)}.heroes-discord__button-positive{font-size:13px}.heroes-discord__button-negative{background-image:linear-gradient(to top, #310b0b, #831f1f);box-shadow:inset 0 0 1px 1px #cecece, inset 0 0 0 3px #0c0d0d;font-size:10px}.heroes-discord__setup{left:calc(50% - 150px);top:calc(50% - 150px)}.heroes-discord__setup .heroes-discord__background{box-sizing:border-box;height:253px;padding:14px}.heroes-discord__button-close{background:url("http://aldous.margonem.pl/img/gui/buttony.png?v=5") -263px -79px;border:1px solid gray;cursor:pointer;height:22px;position:absolute;right:-3px;top:-7px;width:22px}.heroes-discord__button-close:hover{background-position:-286px -79px}.heroes-discord__discord-icon{cursor:pointer;padding-right:4px;padding-top:5px;position:absolute;right:0;top:0;width:27px}.heroes-discord__label{display:block;height:60px;margin-top:16px;text-align:center}.heroes-discord__input{border:1px solid black;height:18px;margin-top:5px;width:80%}.heroes-discord__setup .heroes-discord__buttons-container{border-top:none;margin-top:25px}.heroes-discord__setup .heroes-discord__button-negative{font-size:13px}.bottom-panel-pointer-bg .heroes-discord__discord-icon{background-color:#2c2f33;cursor:url(../img/gui/cursor/5.png), url(../img/gui/cursor/5.cur), auto;font-size:13px;left:40px;padding:0;pointer-events:auto;top:25px}'
    const style = document.createElement("style")
    style.appendChild(document.createTextNode(css))
    document.head.appendChild(style)

    function sendDiscordAlert(webhookUrl, playerNick, npc, mapName, serverName)
    {
        let color = 8388608 //red
        let type1 = "Tytan"
        let type2 = "tytana"
        if (isHeros(npc))
        {
            type1 = "Heros"
            type2 = "herosa"
            color = 8388736 //purple
        }
        let addToThumbnail = ""
        if (getCookie("interface") === "ni")
        {
            addToThumbnail = "/obrazki/npc"
        }
        const request = new XMLHttpRequest()
        request.open("POST", webhookUrl, true)
        request.setRequestHeader("Content-Type", "application/json")
        request.send(JSON.stringify({
            content: `**@here ${type1}:** ${npc.nick} - ${mapName} (${npc.x}, ${npc.y})`,
            username: "Wysłannik zakonu",
            avatar_url: "http://margonem.pl/obrazki/npc/bur/zr_ithan.gif",
            embeds: [{
                color: color,
                title: `${playerNick} znalazł ${type2}!`,
                description: `${npc.nick} - ${mapName} (${npc.x}, ${npc.y}) - ${serverName}`,
                thumbnail: {
                    url: `http://margonem.pl${addToThumbnail}${npc.icon}`
                },
                timestamp: new Date().toISOString()
            }]
        }))
    }

    function isHeros(npc)
    {
        return npc.wt > 79 && npc.wt <= 99
    }

    function closePopup()
    {
        document.body.removeChild(document.getElementById("heroes-popup"))
    }

    function getServerName()
    {
        if (getCookie("interface") === "ni")
        {
            return Engine.worldName[0].toUpperCase() + Engine.worldName.slice(1)
        }
        else
        {
            return g.worldname[0].toUpperCase() + g.worldname.slice(1)
        }

    }


    function displayPopup(nick, npc, map)
    {
        let type = "Tytan"
        if (isHeros(npc))
        {
            type = "Heros"
        }

        const popup = document.createElement("div")
        popup.id = "heroes-popup"
        popup.className = "heroes-discord__popup"

        const popupBackground = document.createElement("div")
        popupBackground.className = "heroes-discord__background"

        const imgContainer = document.createElement("div")
        imgContainer.className = "heroes-discord__img"

        const img = document.createElement("img")
        img.src = "https://margonem.pl/obrazki/npc/" + npc.icon

        imgContainer.appendChild(img)

        popupBackground.appendChild(imgContainer)

        const textContainer = document.createElement("div")
        textContainer.className = "heroes-discord__text"

        const info = document.createElement("span")
        info.innerText = `${type} ${npc.nick} na mapie ${map.name} i kordach (${npc.x},${npc.y})`
        textContainer.appendChild(info)
        textContainer.appendChild(document.createElement("br"))
        const question = document.createElement("span")
        question.innerText = "Powiadomić discorda?"
        textContainer.appendChild(question)

        popupBackground.appendChild(textContainer)

        const buttonContainer = document.createElement("div")
        buttonContainer.className = "heroes-discord__buttons-container"

        const yesButton = document.createElement("button")
        yesButton.className = "heroes-discord__button heroes-discord__button-positive"
        yesButton.innerText = "Powiadom"
        yesButton.addEventListener("click", function ()
        {
            if (!settings.webhookUrl)
            {
                message("Nie skonfigurowałeś dodatku! Ustawienia są w prawym górnym rogu konfiguracji.")
            }
            else
            {
                let name = nick
                if (settings.name)
                {
                    name = nick
                }
                sendDiscordAlert(settings.webhookUrl, name, npc, map.name, getServerName())
                closePopup()
            }

        })
        buttonContainer.appendChild(yesButton)

        const noButton = document.createElement("button")
        noButton.className = "heroes-discord__button heroes-discord__button-negative"
        noButton.innerText = "Nie powiadamiaj"
        noButton.addEventListener("click", closePopup)
        buttonContainer.appendChild(noButton)

        popupBackground.appendChild(buttonContainer)

        popup.appendChild(popupBackground)
        document.body.appendChild(popup)
    }

    const webhookInput = document.createElement("input")
    const nameInput = document.createElement("input")

    function saveSettings()
    {
        settings.webhookUrl = webhookInput.value
        settings.name = nameInput.value

        localStorage.setItem("heroes-discord", JSON.stringify(settings))
    }

    function closeSetup()
    {
        const setup = document.getElementsByClassName("heroes-discord__setup")
        if (setup.length > 0)
        {
            document.body.removeChild(setup[0])
        }
    }

    function showSetup()
    {
        if (document.getElementsByClassName("heroes-discord__setup").length === 0)
        {
            const popup = document.createElement("div")
            popup.className = "heroes-discord__popup heroes-discord__setup"

            const close = document.createElement("div")
            close.className = "heroes-discord__button-close"
            close.addEventListener("click", closeSetup)
            popup.appendChild(close)

            const popupBackground = document.createElement("div")
            popupBackground.className = "heroes-discord__background "

            const webhookLabel = document.createElement("label")
            webhookLabel.className = "heroes-discord__label"
            webhookLabel.innerText = "Link do webhooka (poproś o niego zarządcę serwera discord)"
            popupBackground.appendChild(webhookLabel)

            webhookInput.type = "text"
            webhookInput.className = "heroes-discord__input"
            webhookInput.value = settings.webhookUrl
            webhookLabel.appendChild(webhookInput)

            const nameLabel = document.createElement("label")
            nameLabel.className = "heroes-discord__label"
            nameLabel.innerText = "Nick jaki chcesz by się wyświetlał (zostaw puste jeżeli ma to być nick aktualnej postaci)"
            popupBackground.appendChild(nameLabel)

            nameInput.type = "text"
            nameInput.className = "heroes-discord__input"
            nameInput.value = settings.name
            if (getCookie("interface") === "ni")
            {
                nameInput.placeholder = Engine.hero.nick
            }
            else
            {
                nameInput.placeholder = hero.nick
            }
            nameLabel.appendChild(nameInput)


            const buttonContainer = document.createElement("div")
            buttonContainer.className = "heroes-discord__buttons-container"

            const yesButton = document.createElement("button")
            yesButton.className = "heroes-discord__button heroes-discord__button-positive"
            yesButton.innerText = "Zapisz"
            yesButton.addEventListener("click", saveSettings)
            yesButton.addEventListener("click", closeSetup)
            yesButton.addEventListener("click", function ()
            {
                message("Zapisano! Nie musisz nic odświeżać.")
            })
            buttonContainer.appendChild(yesButton)

            const noButton = document.createElement("button")
            noButton.className = "heroes-discord__button heroes-discord__button-negative"
            noButton.innerText = "Anuluj"
            noButton.addEventListener("click", closeSetup)
            buttonContainer.appendChild(noButton)

            popupBackground.appendChild(buttonContainer)

            popup.appendChild(popupBackground)
            document.body.appendChild(popup)
        }
    }

    function getCookie(cookieName)
    {
        let c_value = " " + document.cookie
        let c_start = c_value.indexOf(" " + cookieName + "=")
        if (c_start === -1)
        {
            c_value = null
        }
        else
        {
            c_start = c_value.indexOf("=", c_start) + 1
            let c_end = c_value.indexOf(";", c_start)
            if (c_end === -1)
            {
                c_end = c_value.length
            }
            c_value = unescape(c_value.substring(c_start, c_end))
        }
        return c_value

    }

    loadSettings()
    if (getCookie("interface") === "ni")
    {

        window.API.addCallbackToEvent("newNpc", function (npc)
        {
            if (npc.d.wt > 79)
            {
                displayPopup(window.Engine.hero.nick, npc.d, window.Engine.map.d)
            }
        })

        const discordIcon = document.createElement("img")
        discordIcon.src = "https://i.imgur.com/i2QLF9l.png"
        discordIcon.alt = "Discord Icon"
        discordIcon.className = "heroes-discord__discord-icon"
        discordIcon.addEventListener("click", showSetup)
        document.getElementsByClassName("bottom-panel-pointer-bg")[0].appendChild(discordIcon)
    }
    else
    {
        const oldNewNpc = window.newNpc
        window.newNpc = function (dane)
        {
            for (const id in dane)
            {
                if (dane.hasOwnProperty(id) && dane[id].wt > 79)
                {
                    displayPopup(window.hero.nick, dane[id], window.map)
                }
            }
            oldNewNpc(dane)
        }


        const discordIcon = document.createElement("img")
        discordIcon.src = "https://i.imgur.com/i2QLF9l.png"
        discordIcon.alt = "Discord Icon"
        discordIcon.className = "heroes-discord__discord-icon"
        discordIcon.addEventListener("click", showSetup)
        document.getElementById("config").appendChild(discordIcon)
    }
})()
