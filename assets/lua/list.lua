local List = {}


function  List.new( )
    local self = {
        elements = {}
    }
    setmetatable(self, {__index = List})
    return self
end


function List:push(element)
    self.elements[#self.elements + 1] = element
end


function List:pop()
    local element = self.elements[1]
    table.remove( self.elements, 1)
    return element
end


function List:last()
    return self.elements[#self.elements]
end


function List:first()
    return self.elements[1]
end

return List