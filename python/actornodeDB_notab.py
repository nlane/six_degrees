from collections import deque
import re
import MySQLdb as mdb
import sys

mycon = mdb.connect('orioles1','nlane', 'enaln', 'nlane2');  # NAME OF HOST, USERNAME, PASSWORD, AND NAME OF DATABASE! (use your own)
cur = mycon.cursor()

class ActorNode:
    def __init__(self, actorid, parentindex, movieid):
        self.actorid = actorid
        self.parentindex = parentindex
        self.movieid = movieid

    def idString(self):
        return (str(self.actorid))
        
    def toString(self):
        return ('id: ' + str(self.actorid) + ', pindx: ' + str(self.parentindex) + ', movid: ' + str(self.movieid))
    

#make this better/faster if possible
def nodesContains(list, value):
    for node in list:
        if(node.actorid == value):
            return True
    return False

#return the actors who have shared any movie with a given actor
def getNeighbors(sourceid, sourceindex):
    #select an actorid ONCE
    cur.execute("select MovieId from BabyRel where ActorId = %s", sourceid)
    #cur.execute("select * from MoviesTest where year = %s", '2005') #heyyyyyyy look we can compare year as a string!
    movies = cur.fetchall()
    neighbors = []
    for m in movies:
        cur.execute("select ActorId from BabyRel where MovieId = %s", m[0])
        cast = cur.fetchall() 
        for c in cast:
            neighbors.append(ActorNode(c[0], sourceindex, m[0]))
            #print('cast of ' + str(m[0]) + " contains: " + str(cast))
    return neighbors
    

#find the target(actorid) via breadth first search from the source
#mark nodes [actorid][parent_index][movieid_shared_w_parent]
def findNode(target):
    counter = 0
    found = False
    while (counter < len(discnodes) and not found):
        currentnode = discnodes[counter]
        #print('currentnode = ' + currentnode.idString())
        if (currentnode.actorid == target):
            #print('target reached: ' + target)
            found = True
            getPath()
            break
        else:
            neighbors = getNeighbors(currentnode.actorid, counter)
            for n in neighbors:
                if (nodesContains(discnodes, n.actorid)):
                    #node already discovered
                    pass
                elif (n.actorid == target):
                    #print('target found via ' + currentnode.idString())
                    discnodes.append(n)#save the INDEX at which the parent is
                    found = True
                    getPath()
                    break
                else:
                    discnodes.append(n) #also add movie
                    #print('added ' + n.idString() + ' via ' + currentnode.idString())
        counter = counter + 1




def getPath():
    print('getting bacon path....')
    
    if(len(discnodes)<= 1):
        print("you tried to connect an actor to themself!")
    else:
        current = discnodes[len(discnodes)-1]
        #print('current = ' + current.idString())
        #print('parent at index = ' + str(current.parentindex))
        
        cur.execute("select FirstName, LastName from Actors where ActorId = %s", current.actorid)
        name = cur.fetchall()
        cur.execute("select MovieId from Movies where MovieId = %s", current.movieid)
        movie = cur.fetchall()
 
        print('Your chosen actor '  + str(name[0][0]) + ' ' + str(name[0][1]) + ' was in ' + str(movie[0][0]) + ' with ')
        current = discnodes[current.parentindex] #move to parent
        
        while (current.parentindex != -1):
            cur.execute("select FirstName, LastName from Actors where id = %s", current.actorid)
            name = cur.fetchall()
            cur.execute("select Title from Movies where MovieId = %s", current.movieid)
            movie = cur.fetchall()
            print('the actor '  + str(name[0][0]) + ' ' + str(name[0][1]) + ' who was in ' + str(movie[0][0]) + ' with ')
            current = discnodes[current.parentindex] #move to parent
        
        cur.execute("select FirstName, LastName from Actors where ActorId = %s", current.actorid)
        sourcename = cur.fetchall()
        print('your chosen actor ' + str(sourcename[0][0]) + ' ' + str(sourcename[0][1]) + "!")

#a list of discovered nodes
#start by adding the source (values = -1 for root)
#node: [actorid][parent_index][movieid_shared_w_parent]
discnodes = []
discnodes.append(ActorNode(sys.argv[1], -1, -1))

#print(getNeighbors(2,1))

findNode(sys.argv[2])
#mycon.commit()

# cur.execute("select FirstName, LastName from Actors where ActorId = %s", sys.argv[1]);
# name1 = cur.fetchall()
# cur.execute("select FirstName, LastName from Actors where ActorId = %s", sys.argv[2]);
# name2 = cur.fetchall()


if mycon:
   mycon.close()