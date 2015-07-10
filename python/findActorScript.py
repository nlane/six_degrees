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
    

#make this better/faster if possible
#is the node in our list of discovered nodes already?
def nodesContains(list, value):
    for node in list:
        if(node.actorid == value):
            return True
    return False

#return the actors who have shared any movie with a given actor
def getNeighbors(sourceid, sourceindex):
    if(directorid !=0):
    	cur.execute("select ActToMov.MovieId from ActToMov join DirectorToMovie on ActToMov.MovieId=DirectorToMovie.MovieId where DirectorToMovie.DirectorId = %s and ActToMov.ActorId = %s", (directorid, sourceid))
    elif(writerid !=0):
    	cur.execute("select ActToMov.MovieId from ActToMov join WriterToMovie on ActToMov.MovieId=WriterToMovie.MovieId where WriterToMovie.WriterId = %s and ActToMov.ActorId = %s", (writerid, sourceid))    
    elif(year != 0):
    	yearend = year + 9
    	cur.execute("select ActToMov.MovieId from ActToMov join Movies on ActToMov.MovieId = Movies.MovieId where ActToMov.ActorId = %s and Movies.Year between %s and %s", (sourceid, year, yearend))
    else:
    	cur.execute("select MovieId from ActToMov where ActorId = %s", sourceid)
    
    movies = cur.fetchall()
    neighbors = []
    for m in movies:
        cur.execute("select ActorId from ActToMov where MovieId = %s", m[0])
        cast = cur.fetchall() 
        for c in cast:
            neighbors.append(ActorNode(c[0], sourceindex, m[0]))
            #print('cast of ' + str(m[0]) + " contains: " + str(cast))
    return neighbors

#just writers and directors
#select actortomov.movieId from actortomovie join directortomov on actortomov.movieId= directortomove.movieId where directortomovdirectorId = 3 and actortomov.actorId = 20;

#select movie by year
#select smallrelation.movieId from smallrelation join smallmovie on smallrelation.movieId = smallmovie.movieId where smallrelation.actorId = 17 and smallmovie.year between year and year+9;    

#find the target(actorid) via breadth first search from the source
#mark nodes [actorid][parent_index][movieid_shared_w_parent]
def findNode(target):
    counter = 0
    found = False
    while (counter < len(discnodes) and not found):
        currentnode = discnodes[counter]
       # print('currentnode = ' + currentnode.idString())
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
                   # print('target found via ' + currentnode.idString())
                    discnodes.append(n)#save the INDEX at which the parent is
                    found = True
                    getPath()
                    break
                else:
                    discnodes.append(n) #also add movie
                    #print('added ' + n.idString() + ' via ' + currentnode.idString())
        counter = counter + 1
    if (not found) :
        print("Actors not connected in database or with your chosen filter, sorry D:")




def getPath():
    #print('getting bacon path....')
    
    if(len(discnodes)<= 1):
        print("you tried to connect an actor to themself!")
    else:
        current = discnodes[len(discnodes)-1]
        #print('current = ' + current.idString())
        #print('parent at index = ' + str(current.parentindex))
        
        cur.execute("select FirstName, LastName from Actors where ActorId = %s", current.actorid)
        name = cur.fetchall()
        cur.execute("select Title from Movies where MovieId = %s", current.movieid)
        movie = cur.fetchall()
 
        print('Your chosen actor '  + str(name[0][0]) + ' ' + str(name[0][1]) + ' was in ' + str(movie[0][0]) + ' with ')
        current = discnodes[current.parentindex] #move to parent
        
        while (current.parentindex != -1):
            cur.execute("select FirstName, LastName from Actors where ActorId = %s", current.actorid)
            name = cur.fetchall()
            cur.execute("select Title from Movies where MovieId = %s", current.movieid)
            movie = cur.fetchall()
            print('the actor '  + str(name[0][0]) + ' ' + str(name[0][1]) + ' who was in ' + str(movie[0][0]) + ' with ')
            current = discnodes[current.parentindex] #move to parent
        
        cur.execute("select FirstName, LastName from Actors where ActorId = %s", current.actorid)
        sourcename = cur.fetchall()
        print('your chosen actor ' + str(sourcename[0][0]) + ' ' + str(sourcename[0][1]) + "!")



#MAIN CODE
source = int(sys.argv[1])
target = int(sys.argv[2])
#source = 1
#target = 7
directorid = 0
writerid = 0
year = 0

if(len(sys.argv) == 5):
	if(sys.argv[4] == "Director"):
		directorid = int(sys.argv[3])
	elif(sys.argv[4] == "Writer"):
		writerid = int(sys.argv[3])
	elif(sys.argv[4] == "Year"):
		year = int(sys.argv[3])
	#there is no way you should be here ever.. GET OUT!


#a list of discovered nodes
#start by adding the source (values = -1 for root)
#node: [actorid][parent_index][movieid_shared_w_parent]
discnodes = []
discnodes.append(ActorNode(source, -1, -1))

#THIS IS THE ACTION!!!! CALLL!!!
findNode(target)

if mycon:
   mycon.close()