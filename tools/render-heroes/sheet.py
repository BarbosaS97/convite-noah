from PIL import Image
import sys
names=["spiderman","ironman","hulk","batman","captain","thor","panther"]
ims=[Image.open(f"out/{n}.png") for n in names]
h=560
ims=[i.resize((int(i.width*h/i.height),h)) for i in ims]
W=sum(i.width for i in ims)+10*len(ims)
sheet=Image.new("RGBA",(W,h),(20,26,70,255))
x=0
for i in ims:
    sheet.alpha_composite(i,(x,0)); x+=i.width+10
sheet.convert("RGB").save("out/_sheet.png")
