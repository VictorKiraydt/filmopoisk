import sys
import csv
import math
import os

def ReadFile (filename = "C:/Users/VictorKiraydt/Documents/git/filmopoisk/server/resources/ratings.csv"):
    #filename = os.path.dirname(os.path.abspath("../resources/ratings.csv")) + "\\ratings.csv"
    f = open (filename)
    r = csv.reader (f)
    mentions = dict()
    iterRatings = iter(r)
    next(iterRatings)
    maxReadedFilms = 1000
    for line in iterRatings:
        if maxReadedFilms == 0:
            break
        userId = line[0]
        movieId = line[1]
        rating = float(line[2])
        if not userId in mentions:
            mentions[userId] = dict()
        mentions[userId][movieId] = rating
        maxReadedFilms = maxReadedFilms - 1
    f.close()
    return mentions

def distCosine (vecA, vecB):
    def dotProduct (vecA, vecB):
        d = 0.0
        for dim in vecA:
            if dim in vecB:
                d += vecA[dim]*vecB[dim]
        return d
    return dotProduct (vecA,vecB) / math.sqrt(dotProduct(vecA,vecA)) / math.sqrt(dotProduct(vecB,vecB))

def makeRecommendation (userId, userRates, nBestUsers, nBestProducts):
    matches = [(u, distCosine(userRates[userId], userRates[u])) for u in userRates if u != userId]
    bestMatches = sorted(matches, reverse = True)[:nBestUsers]

    sim = dict()
    sim_all = sum([x[1] for x in bestMatches])
    bestMatches = dict([x for x in bestMatches if x[1] > 0.0])        
    for relatedUser in bestMatches:
        for product in userRates[relatedUser]:
            if not product in userRates[userId]:
                if not product in sim:
                    sim[product] = 0.0
                sim[product] += userRates[relatedUser][product] * bestMatches[relatedUser]
    for product in sim:
        sim[product] /= sim_all
    bestProducts = sorted(sim.items(), reverse = True)[:nBestProducts]

    for prodInfo in bestProducts:    
        print ('{ "movieId": "%6s", "correlationCoeff": "%6.4f" }' % (prodInfo[0], prodInfo[1]))

if __name__ == "__main__":
    userId = str(sys.argv[1])
    nBestUsers = int(sys.argv[2])
    nBestProducts = int(sys.argv[3])
    makeRecommendation(userId, ReadFile(), nBestUsers, nBestProducts)