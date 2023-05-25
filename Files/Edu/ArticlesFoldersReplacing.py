 # coding: cp1251
import os, fnmatch

def getArticlesFolders( root ):
    patterns = ['*Articles', '*[Сc]татьи']
    for path, foldersList, files in os.walk(root):
        for folder in foldersList:
            for pattern in patterns:
                if fnmatch.fnmatchcase( folder, pattern ):
                    yield os.path.join( path, folder )
                    break

def newPath( path, base ):
    section = path[ len(base) + 1 : path.rfind('\\') ]
    base += '\\Articles\\'
    newPath = base + section
    if section == '':
        newPath += r'General'
    return newPath

def moveArticles( root ):
    for path in getArticlesFolders( root ):
        os.renames( path, newPath( path, root ) )
        #print newPath( path, root )
        #print path

testpath = r'D:\test'
paths = [ r'D:\Education-Science\Computer_Science', 
             r'D:\Education-Science\Математика']

#moveArticles( testpath )

for path in paths:
    moveArticles( path )