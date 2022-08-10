"""
File Description: Python script to generate json (src/data/cf-data.json) from 
plain text data source (~/src/data/celestial-forge.txt)
Author: zeroem
Last Edited: 6/10/2021

"""
import json
import os 
dir_path = os.path.dirname(os.path.realpath(__file__))

#data source file

path = dir_path

#init perk string 
perk_s = ''
#init updated perk price
upp = 0
#init current perk price
cpp = 0 
#init domain counter
dc = 0
#init perk counters
pc = 0
opc = 0
#init perk list
perk_list = []

#helper functions construct perk class
def get_title(perk_s):
    ts = perk_s.find('-')
    te = perk_s.find('(')
    t = perk_s[ts + 1:te -1]
    return t
    
def get_source(perk_s):
    ss = perk_s.find('(') + 1
    se = perk_s.find(')')
    s = perk_s[ss:se]
return s
    
def get_desc(perk_s):
    ds = perk_s.find(']')
    d = perk_s[ds + 1:].strip()
return d

#perk custom class definition


class Perk:

#perk domain list
    dom_list = [
        "Alchemy",
        "Clothing",
        "Crafting",
        "Knowledge",
        "Magic",
        "Magitech",
        "Quality",
        "Resources",
        "Size",
        "Time",
        "Toolkits",
        "Vehicles"
    ]

    def __init__(self, perk_s, cpp, dc):
        self.domain = self.dom_list[dc]
        self.id = str(dc) + '.' + str(opc)
        self.title = get_title(perk_s)
        self.source = get_source(perk_s)
        self.cost = cpp
        self.description = get_desc(perk_s)
        
    def get_dict(self):
        p_dict = {
            'Domain':self.domain,
            'ID':self.id,
            'Title':self.title,
            'Source':self.source,
            'Cost':self.cost,
            'Description':self.description
        }
        return p_dict

with open(path + 'celestial-forge.txt', 'rt') as fi:
    #loop over input file line by line
    for l in fi:
        #pass over empty lines
        if not l.isspace():
            #check for perk string start/end
            if l[0].isdecimal():
                opc = pc
                pc = int(l.split('.')[0])
                #perk string complete, instantiate new perk obj
                temp = Perk(perk_s, cpp, dc)
                #append perk dictionary to perk list
                perk_list.append(temp.get_dict())
                #perk counter reset? increment domain counter
                if pc < opc:
                  dc = dc + 1
                #update current perk price and clear perk string
                cpp = upp
                perk_s = ''
                #perk price change 
            elif l[0] == '$':
                #store updated price while perk instantiates with current
                upp = int(l[1:].split('\s')[0])
                    
            if pc > 0 and l[0] != '$':
                perk_s = perk_s + l
    #remove the first empty dictionary         
    perk_list.pop(0)

with open(path + 'cf-data.json', 'w') as fo:
  perk_json_s = json.dumps(perk_list)
  fo.write(perk_json_s)

#fo.close()
