local List = require "list"

local angleList = List.new()

local speed = -200
local PI = 3.141593

local h = 50
local x = 600
local y = 500
local showAngle = PI/2

for _ = 1, 50, 1 do
    angleList:push(showAngle)
end


local postList = {}

local running = false

local rotate = {
    leftOrRight = 0,
    duration = 0,
}

local Car = {}

function Car.start()
    running = true
end

function Car.pause()
    running = false
end

function Car.unpause()
    running = true
end

function Car.update( dt, leftOrRight )
    if running then
        if leftOrRight ~= rotate.leftOrRight then
            rotate.leftOrRight = leftOrRight
            rotate.duration = 0
        end
        rotate.duration = rotate.duration + dt
        local rs = PI
        local realSpeed = speed
        if rotate.duration > 1 then
            rs = PI
        else
            rs = rs / (2 - rotate.duration)
        end

        if rotate.leftOrRight ~= 0 then
            realSpeed = realSpeed * (PI / rs / 2)
        else
            if rotate.duration < 1 then
                realSpeed = realSpeed / ( 2 - rotate.duration)
            end
        end

        local angle = angleList:last()
        angle = angle + dt * leftOrRight * rs
        angleList:push(angle)

        angle = angleList:pop()
        x =  x + realSpeed * dt * math.cos(angle)
        y =  y + realSpeed * dt * math.sin(angle)
    end
end

function Car.draw()
    local angle = angleList:last()

    love.graphics.circle("fill", x - h / 2 * math.cos(angle), y - h / 2 * math.sin(angle), 4)
    love.graphics.circle("fill", x + h / 2 * math.cos(angle), y + h / 2 * math.sin(angle), 4)


    local headPoint = {
        x = x,
        y = y
    }
    postList[#postList + 1] = headPoint

    for _, pos  in ipairs(postList) do
        love.graphics.circle("fill", pos.x, pos.y, 1)
    end
end

return Car