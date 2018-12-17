"use strict";

let dpi = window.devicePixelRatio
const cv = document.getElementById('background-animation')
const ctx = cv.getContext('2d')
let symbolsArr = []
let gridLength = 9
let mouseOver = false
let mouseMoved = false
let mouse = {x: 0, y: 0}

function fixDpi () {
    const styleHeight = +getComputedStyle(cv).getPropertyValue('height').slice(0, -2)
    const styleWidth = +getComputedStyle(cv).getPropertyValue('width').slice(0, -2)
    cv.setAttribute('height', styleHeight * dpi)
    cv.setAttribute('width', styleWidth * dpi)
}

fixDpi()

const symbolToDraw = function () {
    this.x = 0
    this.y = 0
    this.left = 0
    this.top = 0
    this.width = 0
    this.height = 0
    this.scale = 1
}

symbolToDraw.prototype.draw = function (ctx) {
    ctx.setTransform(this.scale, 0, 0, this.scale, this.left + this.x, this.top + this.y)
    ctx.moveTo(0, -this.height / 2)
    ctx.lineTo(0, this.height / 2)
    ctx.moveTo(-this.width / 2, 0)
    ctx.lineTo(this.width / 2, 0)
}


for (let i = 0; i < gridLength; i++) {
    symbolsArr[i] = []

    for (let el = 0; el < gridLength; el++) {
        let symbol = new symbolToDraw()
        symbol.left = cv.width/(gridLength + 1) * (i + 1)
        symbol.top = cv.height/(gridLength + 1) * (el + 1)
        symbol.width = 25
        symbol.height = 25
        symbolsArr[i][el] = symbol
    }
}

function getRandomColor () {
    let letters = '0123456789ABCDEF'
    let color = '#'

    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }

    return color;
}

function draw () {
    if (mouseOver && mouseMoved) {
        calcSymbolPosition()
        mouseMoved = false
    }

    ctx.clearRect(0, 0, cv.width, cv.height)
    ctx.save()
    ctx.beginPath()

    for (let i = 0; i < gridLength; i++) {
        for (let el = 0; el < gridLength; el++) {
            let symbol = symbolsArr[i][el]
            symbol.draw(ctx)
        }
    }

    ctx.closePath()
    ctx.restore()
    ctx.lineWidth = 5
    ctx.strokeStyle = getRandomColor()
    ctx.stroke()
}

TweenLite.ticker.addEventListener('tick', draw)

function calcSymbolPosition () {
    for (let i = 0; i < gridLength; i++) {
        for (let el = 0; el < gridLength; el++) {
            let symbol = symbolsArr[i][el]
            let radius = 50
            let dx = mouse.x - symbol.left
            let dy = mouse.y - symbol.top
            let dist = Math.sqrt(dx * dx + dy * dy) || 1
            let angle = Math.atan2(dy, dx)

            if (dist < radius) {
                radius = dist
                TweenMax.to(symbol, 0.3, {scale: 2})
            } else {
                TweenMax.to(symbol, 0.3, {scale: 1})
            }

            TweenMax.to(symbol, 0.3, {
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            })
        }
    }
}

function mouseMove (event) {
    let rect = cv.getBoundingClientRect()
    mouse.x = event.clientX - rect.left
    mouse.y = event.clientY - rect.top
    mouseMoved = true
}

cv.addEventListener('mousemove', mouseMove)
cv.addEventListener('mouseenter', () => {
    mouseOver = true
})
cv.addEventListener('mouseleave', () => {
    mouseOver = false
    for (let i = 0; i < gridLength; i++) {
        for (let el = 0; el < gridLength; el++) {
            let symbol = symbolsArr[i][el]
            TweenMax.to(symbol, 0.3, {x: 0, y: 0, scale: 1})
        }
    }
})