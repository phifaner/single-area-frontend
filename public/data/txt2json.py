import re
import json

out_file = open("ezlink_count_2012-11-19.json", "a")

with open("count_2012-11-19.txt", "r") as file:
    i = 0
    json_vec = []
    path_vec = []
    for line in file:
        items = re.split(': |\*|\n', line)
        count = int(items[-2])
        points = items[:-2][0].split('->')

        # print count

        pnt_last = points[0]
        # delete duplicated points
        pnt_vec = [int(pnt_last)] if pnt_last != '' else [] 

        for p in points:
            if p != pnt_last:
                pnt_vec.append(int(p))
                pnt_last = p

        # print path_vec
        if pnt_vec not in path_vec:
            # print "-------"
            path_vec.append(pnt_vec)
            j = {'count': count, 'points': pnt_vec}
            json_vec.append(j)

        i += 1
        if i % 1000 == 0:
        # if i < 10:
            print "start to dump {0} lines".format(i)
            # print json_vec
            out_file.write(json.dumps(json_vec))
            json_vec = []
        # else:
        #     break    
        # print json.dumps(j)

    file.close()

out_file.close()