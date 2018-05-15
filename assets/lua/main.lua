local car = require "car"

local leftPressed = false
local rightPressed = false

function love.load()
    love.window.setMode(1200, 960, {resizable=false, vsync=false, minwidth=400, minheight=300})
end


function love.update( dt )
    -- body
    local leftOrRight = 0
    if leftPressed then
        leftOrRight = -1
    end

    if rightPressed then
        leftOrRight = 1
    end

    if leftPressed and rightPressed then
        leftOrRight = 0
    end

    car.update(dt, leftOrRight)
end

function love.draw()
    car.draw()
end

function love.keypressed( key, scancode )
    if key == "a" and not leftPressed then
        leftPressed = true
    end

    if key == "d" and not rightPressed then
        rightPressed = true
    end

    if key == "s" then
        car.start()
    end

    if key == "p" then
        car.pause()
    end
end

function love.keyreleased( key, scancode )
    if key == "a" then
        leftPressed = false
    end
    if key == "d" then
        rightPressed = false
    end

    if key == "p" then
        car.unpause()
    end
end