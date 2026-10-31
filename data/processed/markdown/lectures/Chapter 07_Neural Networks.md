# Chapter 07_Neural Networks

- **Source File**: `Chapter 07_Neural Networks.pdf`
- **Total Pages**: 86

---

## Slide / Page 1

Natural Language Processing
Chapter 7
Neural Networks &
Neural Language Models
Prof. Ahmed Guessoum
The National Higher School of AI

---

## Slide / Page 2

Units in Neural Networks
(Material from ML: Individual Reading)

---

## Slide / Page 3

This is in your brain
3
By BruceBlaus - Own work, CC BY 3.0,
https://commons.wikimedia.org/w/index.php?curid=28761830

---

## Slide / Page 4

Neural Network Unit
This is not in your brain
4
x1 x2 x3
y
w1 w2 w3
∑
b
σ
+1
z
a
Weights
Input layer
Weighted sum
Non-linear transform
Output value
bias

---

## Slide / Page 5

Neural unit
• Take weighted sum of inputs, plus a bias
• Instead of just using z, we'll apply a
nonlinear activation function f:
2 CHAPTER 7 • NEURAL NETWORKS AND NEURAL LANGUAGE MODELS
7.1 Units
Thebuildingblockof ane ura lne twork is as inglecomputa tiona lunit. A unitta kes
a s e tof realva lue dnumbe rsasinput,pe rformss omecomputa tionon the m,a nd
produce sanoutput.
At its he a rt,ane ura lunitis ta kingawe ighte ds umof its inputs ,with onea ddi-
tiona lte rmin thes umca lle da biaste rm. Givena s e tof inputsx1...xn, a unit ha sbiaste rm
a s e tof corre s pondingwe ights w1...wn a nda bia sb, sothewe ighte ds umz ca nbe
re pre s e nte da s :
z= b+
X
i
wixi (7.1)
Ofte nit’smoreconve nie nttoexpre s sthiswe ighte ds umus ingve ctornota tion;re ca ll
from line a ra lge bratha ta ve ctoris ,at he a rt,jus ta lis tor a rra yof numbe rs .Thusve ctor
we’ll ta lka boutzin te rmsof awe ightve ctorw, as ca la rbia sb, a ndaninputve ctor
x, a ndwe’ll re pla cethes umwith theconve nie ntdot product:
z= w·x+ b (7.2)
Asdeﬁnedin Eq.7.2, zis jus tare a lva lue dnumbe r.
Fina lly, ins te a dof us ingz, a line a rfunctionof x, astheoutput,ne ura lunits
a pplya non-line a rfunction f to z. We will re fe rto theoutputof this functionas
theactivation va luefor theunit, a. S incewe a rejus tmode linga s ingleunit, theactivation
a ctiva tionforthenodeisin fa cttheﬁnaloutputof thene twork,whichwe’ll ge ne ra lly
ca lly. Sotheva luey isdeﬁneda s :
y= a= f(z)
We’ll dis cus sthre epopula rnon-line a rfunctionsf() be low (thes igmoid,theta nh,
a ndtherectiﬁedline a rRe LU)butit’s pe da gogica llyconve nie ntto s ta rtwith the
s igmoidfunctions incewesaw it in Cha pte r5:s igmoid
y= s (z)= 11+ e− z (7.3)
Thes igmoid(s hownin Fig.7.1) ha sanumbe rof a dva nta ge s ;it ma pstheoutput
into thera nge[0,1], whichis us e fulin s qua s hingoutlie rstowa rd0 or 1. Andit’s
diffe re ntia ble ,whichaswesaw in S e ction??will beha ndyfor le a rning.
Figure7.1 Thes igmoidfunctionta kesa re a lva luea ndma psit to thera nge[0,1]. It is
ne a rlyline a ra round0 but outlie rva lue sge ts qua s he dtowa rd0 or1.
2 CHAPTER 7 • NEURAL NETWORKS AND NEURAL LANGUAGE MODELS
7.1 Units
Thebuildingblockof ane ura lne tworkis as inglecomputa tiona lunit. A unitta kes
a s e tof realva lue dnumbe rsasinput,pe rformss omecomputa tionon the m,a nd
produce sanoutput.
At its he a rt,ane ura lunitis ta kingawe ighte ds umof its inputs ,with onea ddi-
tiona lte rmin thes umca lle da biaste rm. Givena s e tof inputsx1...xn, a unit ha sbiaste rm
a s e tof corre s pondingwe ights w1...wn a nda bia sb, sothewe ighte ds umz ca nbe
re pre s e nte da s :
z= b+
X
i
wixi (7.1)
Ofte nit’smoreconve nie nttoexpre s sthiswe ighte ds umus ingve ctornota tion;re ca ll
fromline a ra lge bratha ta ve ctoris ,at he a rt,jus ta lis tor a rra yof numbe rs .Thusve ctor
we’ll ta lka boutzin te rmsof awe ightve ctorw, as ca la rbia sb, a ndaninputve ctor
x, a ndwe’ll re pla cethes umwiththeconve nie ntdot product:
z= w·x+ b (7.2)
Asdeﬁnedin Eq.7.2, zis jus tare a lva lue dnumbe r.
Fina lly, ins te a dof us ingz, a line a rfunctionof x, astheoutput,ne ura lunits
a pplya non-line a rfunction f to z. We will re fe rto theoutputof thisfunctionas
theactivation va luefor theunit, a. S incewea rejus tmode linga s ingleunit, theactivation
a ctiva tionforthenodeisin fa cttheﬁnaloutputofthene twork,whichwe’ll ge ne ra lly
ca lly. Sotheva luey isdeﬁneda s :
y= a= f(z)
We’ll dis cus sthre epopula rnon-line a rfunctionsf() be low (thes igmoid,theta nh,
a ndtherectiﬁedline a rRe LU)butit’s pe da gogica llyconve nie ntto s ta rtwith the
s igmoidfunctions incewesaw it in Cha pte r5:s igmoid
y= s (z)= 11+ e− z (7.3)
Thes igmoid(s hownin Fig.7.1) ha sanumbe rof a dva nta ge s ;it ma pstheoutput
into thera nge[0,1], whichis us e fulin s qua s hingoutlie rstowa rd0 or 1. Andit’s
diffe re ntia ble ,whichaswesaw in S e ction??will beha ndyfor le a rning.
Figure7.1 Thes igmoidfunctionta kesa re a lva luea ndma psit to thera nge[0,1]. It is
ne a rlyline a ra round0 butoutlie rva lue sge ts qua s he dtowa rd0 or1.
𝑧 = ෍
𝑖=1
𝑛
𝑤𝑖𝑥𝑖 + 𝑏
5

---

## Slide / Page 6

Non-Linear Activation Functions
6
Sigmoid
We're already seen the sigmoid for logistic regression:
2 CHA PTER 7 • NEURAL NETWORKS AND NEURAL LANGUAGE MODELS
7.1 Units
Thebuilding blockof a neuralnetwork is a singlecomputationalunit. A unit takes
a setof real valuednumbersasinput, performssomecomputationon them,and
producesanoutput.
At its heart,a neuralunit is takinga weightedsumof its inputs,with oneaddi-
tional termin thesumcalleda bias term. Givena setof inputsx1...xn, a unit hasbiasterm
a setof correspondingweights w1...wn anda biasb, sotheweightedsumz canbe
representedas:
z= b+
X
i
wixi (7.1)
Oftenit’smoreconvenientto expressthisweightedsumusingvectornotation;recall
from linearalgebrathata vector is, at heart,just a list or arrayof numbers.Thusvector
we’ll talk aboutz in termsof aweightvectorw, a scalarbiasb, andaninputvector
x, andwe’ll replacethesumwith theconvenientdot product:
z= w·x+ b (7.2)
Asdeﬁnedin Eq.7.2, zis justarealvaluednumber.
Finally, insteadof using z, a linear function of x, as the output,neuralunits
applya non-linearfunction f to z. We will referto the outputof this functionas
theactivation valuefor the unit, a. Sincewe arejust modelinga singleunit, theactivation
activationfor thenodeisin facttheﬁnaloutputof thenetwork,whichwe’ll generally
call y. Sothevaluey isdeﬁnedas:
y = a = f(z)
We’ll discussthreepopularnon-linearfunctions f() below (thesigmoid,thetanh,
andtherectiﬁedlinear ReLU) but it’s pedagogicallyconvenientto startwith the
sigmoidfunctionsincewesaw it in Chapter5:sigmoid
y = s (z)= 11+ e− z (7.3)
Thesigmoid(shown in Fig.7.1) hasanumberof advantages;it mapstheoutput
into therange[0,1], which is usefulin squashingoutlierstoward0 or 1. Andit’s
differentiable,whichaswesaw in Section??will behandyfor learning.
Figure7.1 The sigmoidfunctiontakesa real valueandmapsit to the range[0,1]. It is
nearlylineararound0 but outliervaluesgetsquashedtoward0 or 1.

---

## Slide / Page 7

Final function the unit is
computing
7.1 • UNIT S 3
SubstitutingEq.7.2into Eq.7.3givesustheoutputof aneuralunit:
y = s (w·x+ b)= 11+ exp(− (w·x+ b)) (7.4)
Fig. 7.2shows aﬁnal schematicof a basicneuralunit. In this exampletheunit
takes3 inputvaluesx1, x2, andx3, andcomputesa weightedsum,multiplying each
valuebyaweight(w1, w2, andw3, respectively),addsthemtoabiastermb, andthen
passestheresultingsumthroughasigmoidfunctionto resultin anumberbetween0
and1.
x1 x2 x3
y
w1 w2 w3
∑
b
σ
+1
z
a
Figure7.2 A neuralunit,taking3 inputsx1, x2, andx3 (andabiasb thatwerepresentasa
weightfor aninputclampedat +1) andproducinganoutputy. We includesomeconvenient
intermediatevariables:theoutputof thesummation,z, andtheoutputof thesigmoid,a. In
this casetheoutputof theunit y is thesameasa, but in deepernetworkswe’ll reserve y to
meantheﬁnal outputof theentirenetwork,leaving a astheactivationof anindividualnode.
Let’s walk throughanexamplejustto getanintuition.Let’s supposewehave a
unit with thefollowing weightvectorandbias:
w =[ 0.2,0.3,0.9]
b = 0.5
Whatwouldthisunit dowith thefollowing inputvector:
x =[ 0.5,0.6,0.1]
Theresultingoutputy wouldbe:
y = s (w·x+ b)= 11+ e− (w·x+ b) = 11+ e− (.5⇤.2+ .6⇤.3+ .1⇤.9+ .5) = 11+ e− 0.87 = .70
In practice,thesigmoidis notcommonlyusedasanactivationfunction.A function
thatis verysimilarbut almostalwaysbetteris thetanh functionshown in Fig.7.3a;tanh
tanhis avariantof thesigmoidthatrangesfrom -1 to +1:
y = ez− e− z
ez+ e− z (7.5)
Thesimplestactivationfunction,andperhapsthemostcommonlyused,is therec-
tiﬁed linearunit, alsocalledtheReLU, shown in Fig. 7.3b. It’s just thesameasxReLU
whenx is positive,and0 otherwise:
y = m ax(x,0) (7.6)
7

---

## Slide / Page 8

Final unit again
8
x1 x2 x3
y
w1 w2 w3
∑
b
σ
+1
z
a
Weights
Input layer
Weighted sum
Non-linear activation function
Output value
bias

---

## Slide / Page 9

An example
• Suppose a unit has:
• w = [0.2,0.3,0.9]
• b = 0.5
• What happens with input x:
• x = [0.5,0.6,0.1]
7.1 • UNIT S 3
SubstitutingEq.7.2into Eq.7.3givesustheoutputof aneuralunit:
y = s (w·x+ b)= 11+ exp(− (w·x+ b)) (7.4)
Fig. 7.2shows aﬁnal schematicof a basicneuralunit. In this exampletheunit
takes3 inputvaluesx1,x2, andx3, andcomputesa weightedsum,multiplying each
valuebyaweight(w1, w2, andw3, respectively),addsthemtoabiastermb, andthen
passestheresultingsumthroughasigmoidfunctionto resultin anumberbetween0
and1.
x1 x2 x3
y
w1 w2 w3
∑
b
σ
+1
z
a
Figure7.2 A neuralunit,taking3 inputsx1, x2, andx3 (andabiasb thatwerepresentasa
weightfor aninputclampedat +1) andproducinganoutputy. We includesomeconvenient
intermediatevariables:theoutputof thesummation,z, andtheoutputof thesigmoid,a. In
this casetheoutputof theunit y is thesameasa, but in deepernetworkswe’ll reserve y to
meantheﬁnal outputof theentirenetwork,leaving a astheactivationof anindividualnode.
Let’s walk throughanexamplejustto getanintuition.Let’s supposewehave a
unit with thefollowing weightvectorandbias:
w =[ 0.2,0.3,0.9]
b = 0.5
Whatwouldthisunit dowith thefollowing inputvector:
x =[ 0.5,0.6,0.1]
Theresultingoutputy wouldbe:
y = s (w·x+ b)= 11+ e− (w·x+ b) = 11+ e− (.5⇤.2+ .6⇤.3+ .1⇤.9+ .5) = 11+ e− 0.87 = .70
In practice,thesigmoidis notcommonlyusedasanactivationfunction.A function
thatis verysimilarbut almostalwaysbetteris thetanh functionshown in Fig.7.3a;tanh
tanhis avariantof thesigmoidthatrangesfrom -1 to +1:
y = ez− e− z
ez+ e− z (7.5)
Thesimplestactivationfunction,andperhapsthemostcommonlyused,is therec-
tiﬁed linearunit, alsocalledtheReLU, shown in Fig. 7.3b. It’s just thesameasxReLU
whenx is positive,and0 otherwise:
y = m ax(x,0) (7.6)
9

---

## Slide / Page 10

An example
• Suppose a unit has:
•w = [0.2,0.3,0.9]
•b = 0.5
• What happens with the following input
x?
x = [0.5,0.6,0.1]
7.1 • UNIT S 3
SubstitutingEq.7.2into Eq.7.3givesustheoutputof aneuralunit:
y = s (w·x+ b)= 11+ exp(− (w·x+ b)) (7.4)
Fig. 7.2shows aﬁnal schematicof a basicneuralunit. In this exampletheunit
takes3 inputvaluesx1,x2, andx3, andcomputesa weightedsum,multiplying each
valuebyaweight(w1, w2, andw3, respectively),addsthemtoabiastermb, andthen
passestheresultingsumthroughasigmoidfunctionto resultin anumberbetween0
and1.
x1 x2 x3
y
w1 w2 w3
∑
b
σ
+1
z
a
Figure7.2 A neuralunit,taking3 inputsx1, x2, andx3 (andabiasb thatwerepresentasa
weightfor aninputclampedat +1) andproducinganoutputy. We includesomeconvenient
intermediatevariables:theoutputof thesummation,z, andtheoutputof thesigmoid,a. In
this casetheoutputof theunit y is thesameasa, but in deepernetworkswe’ll reserve y to
meantheﬁnal outputof theentirenetwork,leaving a astheactivationof anindividualnode.
Let’s walk throughanexamplejustto getanintuition.Let’s supposewehave a
unit with thefollowing weightvectorandbias:
w =[ 0.2,0.3,0.9]
b = 0.5
Whatwouldthisunit dowith thefollowing inputvector:
x =[ 0.5,0.6,0.1]
Theresultingoutputy wouldbe:
y = s (w·x+ b)= 11+ e− (w·x+ b) = 11+ e− (.5⇤.2+ .6⇤.3+ .1⇤.9+ .5) = 11+ e− 0.87 = .70
In practice,thesigmoidis notcommonlyusedasanactivationfunction.A function
thatis verysimilarbut almostalwaysbetteris thetanh functionshown in Fig.7.3a;tanh
tanhis avariantof thesigmoidthatrangesfrom -1 to +1:
y = ez− e− z
ez+ e− z (7.5)
Thesimplestactivationfunction,andperhapsthemostcommonlyused,is therec-
tiﬁed linearunit, alsocalledtheReLU, shown in Fig. 7.3b. It’s just thesameasxReLU
whenx is positive,and0 otherwise:
y = m ax(x,0) (7.6)
7.1 • UNIT S 3
SubstitutingEq.7.2into Eq.7.3givesustheoutputof aneuralunit:
y = s (w·x+ b)= 11+ exp(− (w·x+ b)) (7.4)
Fig. 7.2showsaﬁnal schematicof a basicneuralunit. In this exampletheunit
takes3 inputvaluesx1, x2, andx3, andcomputesa weightedsum,multiplying each
valuebyaweight(w1, w2, andw3, respectively),addsthemtoabiastermb, andthen
passestheresultingsumthroughasigmoidfunctionto resultin anumberbetween0
and1.
x1 x2 x3
y
w1 w2 w3
∑
b
σ
+1
z
a
Figure7.2 A neuralunit,taking3 inputsx1, x2, andx3 (andabiasb thatwerepresentasa
weightfor aninput clampedat +1) andproducinganoutputy. We includesomeconvenient
intermediatevariables:theoutputof thesummation,z, andtheoutputof thesigmoid,a. In
this casetheoutputof theunit y is thesameasa, but in deepernetworkswe’ll reserve y to
meantheﬁnal outputof theentirenetwork,leaving a astheactivationof anindividualnode.
Let’s walk throughanexamplejustto getanintuition.Let’s supposewehave a
unit with thefollowing weightvectorandbias:
w =[ 0.2,0.3,0.9]
b = 0.5
Whatwouldthisunit dowith thefollowing inputvector:
x =[ 0.5,0.6,0.1]
Theresultingoutputy wouldbe:
y = s (w·x+ b)= 11+ e− (w·x+ b) = 11+ e− (.5⇤.2+ .6⇤.3+ .1⇤.9+ .5) = 11+ e− 0.87 = .70
In practice,thesigmoidis notcommonlyusedasanactivationfunction.A function
thatis verysimilarbut almostalwaysbetteris thetanh functionshown in Fig.7.3a;tanh
tanhis avariantof thesigmoidthatrangesfrom -1 to +1:
y = ez− e− z
ez+ e− z (7.5)
Thesimplestactivationfunction,andperhapsthemostcommonlyused,is therec-
tiﬁed linearunit, alsocalledtheReLU, shown in Fig. 7.3b. It’s just thesameasxReLU
whenx is positive,and0 otherwise:
y = m ax(x,0) (7.6)
10

---

## Slide / Page 11

An example
• Suppose a unit has:
• w = [0.2,0.3,0.9]
• b = 0.5
• What happens with input x:
• x = [0.5,0.6,0.1]
7.1 • UNIT S 3
SubstitutingEq.7.2into Eq.7.3givesustheoutputof aneuralunit:
y = s (w·x+ b)= 11+ exp(− (w·x+ b)) (7.4)
Fig. 7.2shows aﬁnal schematicof a basicneuralunit. In this exampletheunit
takes3 inputvaluesx1,x2, andx3, andcomputesa weightedsum,multiplying each
valuebyaweight(w1, w2, andw3, respectively),addsthemtoabiastermb, andthen
passestheresultingsumthroughasigmoidfunctionto resultin anumberbetween0
and1.
x1 x2 x3
y
w1 w2 w3
∑
b
σ
+1
z
a
Figure7.2 A neuralunit,taking3 inputsx1, x2, andx3 (andabiasb thatwerepresentasa
weightfor aninputclampedat +1) andproducinganoutputy. We includesomeconvenient
intermediatevariables:theoutputof thesummation,z, andtheoutputof thesigmoid,a. In
this casetheoutputof theunit y is thesameasa, but in deepernetworkswe’ll reserve y to
meantheﬁnal outputof theentirenetwork,leaving a astheactivationof anindividualnode.
Let’s walk throughanexamplejustto getanintuition.Let’s supposewehave a
unit with thefollowing weightvectorandbias:
w =[ 0.2,0.3,0.9]
b = 0.5
Whatwouldthisunit dowith thefollowing inputvector:
x =[ 0.5,0.6,0.1]
Theresultingoutputy wouldbe:
y = s (w·x+ b)= 11+ e− (w·x+ b) = 11+ e− (.5⇤.2+ .6⇤.3+ .1⇤.9+ .5) = 11+ e− 0.87 = .70
In practice,thesigmoidis notcommonlyusedasanactivationfunction.A function
thatis verysimilarbut almostalwaysbetteris thetanh functionshown in Fig.7.3a;tanh
tanhis avariantof thesigmoidthatrangesfrom -1 to +1:
y = ez− e− z
ez+ e− z (7.5)
Thesimplestactivationfunction,andperhapsthemostcommonlyused,is therec-
tiﬁed linearunit, alsocalledtheReLU, shown in Fig. 7.3b. It’s just thesameasxReLU
whenx is positive,and0 otherwise:
y = m ax(x,0) (7.6)
7.1 • UNIT S 3
SubstitutingEq.7.2into Eq.7.3givesustheoutputof aneuralunit:
y = s (w·x+ b)= 11+ exp(− (w·x+ b)) (7.4)
Fig. 7.2showsaﬁnal schematicof a basicneuralunit. In this exampletheunit
takes3 inputvaluesx1, x2, andx3, andcomputesa weightedsum,multiplying each
valuebyaweight(w1, w2, andw3, respectively),addsthemtoabiastermb, andthen
passestheresultingsumthroughasigmoidfunctionto resultin anumberbetween0
and1.
x1 x2 x3
y
w1 w2 w3
∑
b
σ
+1
z
a
Figure7.2 A neuralunit,taking3 inputsx1, x2, andx3 (andabiasb thatwerepresentasa
weightfor aninput clampedat +1) andproducinganoutputy. We includesomeconvenient
intermediatevariables:theoutputof thesummation,z, andtheoutputof thesigmoid,a. In
this casetheoutputof theunit y is thesameasa, but in deepernetworkswe’ll reserve y to
meantheﬁnal outputof theentirenetwork,leaving a astheactivationof anindividualnode.
Let’s walk throughanexamplejustto getanintuition.Let’s supposewehave a
unit with thefollowing weightvectorandbias:
w =[ 0.2,0.3,0.9]
b = 0.5
Whatwouldthisunit dowith thefollowing inputvector:
x =[ 0.5,0.6,0.1]
Theresultingoutputy wouldbe:
y = s (w·x+ b)= 11+ e− (w·x+ b) = 11+ e− (.5⇤.2+ .6⇤.3+ .1⇤.9+ .5) = 11+ e− 0.87 = .70
In practice,thesigmoidis notcommonlyusedasanactivationfunction.A function
thatis verysimilarbut almostalwaysbetteris thetanh functionshown in Fig.7.3a;tanh
tanhis avariantof thesigmoidthatrangesfrom -1 to +1:
y = ez− e− z
ez+ e− z (7.5)
Thesimplestactivationfunction,andperhapsthemostcommonlyused,is therec-
tiﬁed linearunit, alsocalledtheReLU, shown in Fig. 7.3b. It’s just thesameasxReLU
whenx is positive,and0 otherwise:
y = m ax(x,0) (7.6)
7.1 • UNIT S 3
SubstitutingEq.7.2into Eq.7.3givesustheoutputof aneuralunit:
y = s (w·x+ b)= 11+ exp(− (w·x+ b)) (7.4)
Fig. 7.2shows aﬁnal schematicof a basicneuralunit. In this exampletheunit
takes3 input valuesx1, x2, andx3, andcomputesa weightedsum,multiplying each
valueby aweight(w1, w2, andw3, respectively),addsthemto abiastermb, andthen
passestheresultingsumthroughasigmoidfunctionto resultin anumberbetween0
and1.
x1 x2 x3
y
w1 w2 w3
∑
b
σ
+1
z
a
Figure7.2 A neuralunit, taking3 inputsx1, x2, andx3 (andabiasb thatwerepresentasa
weightfor aninput clampedat +1) andproducinganoutputy. We includesomeconvenient
intermediatevariables:theoutputof thesummation,z, andtheoutputof thesigmoid,a. In
this casetheoutputof theunit y is thesameasa, but in deepernetworkswe’ll reserve y to
meantheﬁnal outputof theentirenetwork, leaving a astheactivationof anindividualnode.
Let’s walk throughanexamplejust to getanintuition.Let’s supposewe have a
unit with thefollowing weightvectorandbias:
w =[ 0.2,0.3,0.9]
b = 0.5
Whatwouldthisunit dowith thefollowing inputvector:
x =[ 0.5,0.6,0.1]
Theresultingoutputy wouldbe:
y = s (w·x+ b)= 11+ e− (w·x+ b) = 11+ e− (.5⇤.2+ .6⇤.3+ .1⇤.9+ .5) = 11+ e− 0.87 = .70
In practice,thesigmoidis notcommonlyusedasanactivationfunction.A function
thatis verysimilarbut almostalwaysbetteris thetanh functionshown in Fig. 7.3a;tanh
tanhis a variantof thesigmoidthatrangesfrom -1 to +1:
y = ez − e− z
ez+ e− z (7.5)
Thesimplestactivationfunction,andperhapsthemostcommonlyused,is therec-
tiﬁed linearunit, alsocalledtheReLU, shown in Fig. 7.3b. It’s just thesameasxReLU
whenx is positive,and0 otherwise:
y = m ax(x,0) (7.6)
7.1 • UNIT S 3
SubstitutingEq.7.2into Eq.7.3givesustheoutputof aneuralunit:
y = s (w·x+ b)= 11+ exp(− (w·x+ b)) (7.4)
Fig. 7.2shows aﬁnal schematicof a basicneuralunit. In this exampletheunit
takes3 inputvaluesx1, x2, andx3, andcomputesa weightedsum,multiplying each
valuebyaweight(w1, w2, andw3, respectively),addsthemto abiastermb, andthen
passestheresultingsumthroughasigmoidfunctionto resultin anumberbetween0
and1.
x1 x2 x3
y
w1 w2 w3
∑
b
σ
+1
z
a
Figure7.2 A neuralunit, taking3 inputsx1, x2, andx3 (andabiasb thatwerepresentasa
weightfor aninput clampedat +1) andproducinganoutputy. We includesomeconvenient
intermediatevariables:theoutputof thesummation,z, andtheoutputof thesigmoid,a. In
this casetheoutputof theunit y is thesameasa, but in deepernetworkswe’ll reserve y to
meantheﬁnal outputof theentirenetwork,leaving a astheactivationof anindividualnode.
Let’s walk throughanexamplejustto getanintuition.Let’s supposewehave a
unit with thefollowing weightvectorandbias:
w =[ 0.2,0.3,0.9]
b = 0.5
Whatwouldthisunit dowith thefollowing inputvector:
x =[ 0.5,0.6,0.1]
Theresultingoutputy wouldbe:
y = s (w·x+ b)= 11+ e− (w·x+ b) = 11+ e− (.5⇤.2+ .6⇤.3+ .1⇤.9+ .5) = 11+ e− 0.87 = .70
In practice,thesigmoidis notcommonlyusedasanactivationfunction.A function
thatis verysimilarbut almostalwaysbetteris thetanh functionshown in Fig.7.3a;tanh
tanhis avariantof thesigmoidthatrangesfrom -1 to +1:
y = ez− e− z
ez+ e− z (7.5)
Thesimplestactivationfunction,andperhapsthemostcommonlyused,is therec-
tiﬁed linearunit, alsocalledtheReLU, shown in Fig. 7.3b. It’s just thesameasxReLU
whenx is positive,and0 otherwise:
y = m ax(x,0) (7.6)
11

---

## Slide / Page 12

Non-Linear Activation Functions
besides sigmoid
12
tanh ReLU
Rectified Linear Unit
7.1 • UNIT S 3
SubstitutingEq.7.2into Eq.7.3givesustheoutputof aneuralunit:
y = s (w·x+ b)= 11+ exp(− (w·x+ b)) (7.4)
Fig. 7.2shows aﬁnal schematicof a basicneuralunit. In this exampletheunit
takes3 input valuesx1, x2, andx3, andcomputesa weightedsum,multiplying each
valueby aweight(w1, w2, andw3, respectively),addsthemto abiastermb, andthen
passestheresultingsumthroughasigmoidfunctionto resultin anumberbetween0
and1.
x1 x2 x3
y
w1 w2 w3
∑
b
σ
+1
z
a
Figure7.2 A neuralunit, taking3 inputsx1, x2, andx3 (andabiasb thatwerepresentasa
weightfor aninput clampedat +1) andproducinganoutputy. We includesomeconvenient
intermediatevariables:theoutputof thesummation,z, andtheoutputof thesigmoid,a. In
this casetheoutputof theunit y is thesameasa, but in deepernetworkswe’ll reserve y to
meantheﬁnal outputof theentirenetwork, leaving a astheactivationof anindividualnode.
Let’s walk throughanexamplejust to getanintuition.Let’s supposewe have a
unit with thefollowing weightvectorandbias:
w =[ 0.2,0.3,0.9]
b = 0.5
Whatwouldthisunit dowith thefollowing inputvector:
x =[ 0.5,0.6,0.1]
Theresultingoutputy wouldbe:
y = s (w·x+ b)= 11+ e− (w·x+ b) = 11+ e− (.5⇤.2+ .6⇤.3+ .1⇤.9+ .5) = 11+ e− 0.87 = .70
In practice,thesigmoidis notcommonlyusedasanactivationfunction.A function
thatis verysimilarbut almostalwaysbetteris thetanh functionshown in Fig. 7.3a;tanh
tanhis avariantof thesigmoidthatrangesfrom -1 to +1:
y = ez − e− z
ez+ e− z (7.5)
Thesimplestactivationfunction,andperhapsthemostcommonlyused,is therec-
tiﬁed linearunit, alsocalledtheReLU, shown in Fig. 7.3b. It’s just thesameasxReLU
whenx is positive,and0 otherwise:
y = m ax(x,0) (7.6)
7.1 • UNIT S 3
S ubs titutingEq.7.2intoEq.7.3givesustheoutputof ane ura lunit:
y = s (w·x+ b)= 11+ exp(− (w·x+ b)) (7.4)
Fig.7.2s howsaﬁnal s che ma ticof aba s icne ura lunit. In thisexa mpletheunit
ta kes3 inputva lue sx1,x2, a ndx3, a ndcompute sawe ighte ds um,multiplyinge a ch
va luebyawe ight(w1, w2, a ndw3, re s pe ctive ly),a ddsthe mtoabia ste rmb, a ndthe n
pa s s e sthere s ultings umthroughas igmoidfunctiontore s ultin anumbe rbe twe e n0
a nd1.
x1 x2 x3
y
w1 w2 w3
∑
b
σ
+1
z
a
Figure7.2 A ne ura lunit,ta king3 inputsx1, x2, a ndx3 (a ndabia sb tha twere pre se ntasa
we ightfor aninputcla mpe dat+1)a ndproducinganoutputy. Weincludesomeconve nie nt
inte rme dia teva ria ble s:theoutputof thesumma tion,z, a ndtheoutputof thesigmoid,a. In
thisca setheoutputof theunit y is thesa measa, but in de e pe rne tworkswe’ll re se rve y to
me a ntheﬁnaloutputof thee ntirene twork,le aving a asthea ctiva tionof anindividua lnode .
Let’swa lkthroughanexa mplejus tto ge tanintuition.Let’ss uppos ewehavea
unitwith thefollowingwe ightve ctora ndbia s :
w =[ 0.2,0.3,0.9]
b = 0.5
Wha twouldthisunitdowith thefollowinginputve ctor:
x =[ 0.5,0.6,0.1]
There s ultingoutputy wouldbe :
y= s (w·x+ b)= 11+ e− (w·x+ b) = 11+ e− (.5⇤.2+ .6⇤.3+ .1⇤.9+ .5) = 11+ e− 0.87 = .70
In pra ctice ,thes igmoidis notcommonlyus e dasana ctiva tionfunction.A function
tha tis ve rys imila rbut a lmos talwa ysbe tte ris thetanh functions hownin Fig.7.3a;tanh
ta nhis ava ria ntof thes igmoidtha tra nge sfrom-1 to +1:
y= ez− e− z
ez+ e− z (7.5)
Thes imple s ta ctiva tionfunction,a ndpe rha psthemos tcommonlyus e d,is there c-
tiﬁed line a runit, a ls oca lle dtheRe LU, s hown in Fig. 7.3b. It’s jus tthes a measzRe LU
whe nzis pos itive,a nd0 othe rwis e :
y= m ax(z,0) (7.6)
Most Common:

---

## Slide / Page 13

The XOR problem
(Material from ML: Individual Reading)

---

## Slide / Page 14

The XOR problem
• Can neural units compute simple
functions of input?
Minsky and Papert (1969)
4 CHA PTER 7 • NEURAL NETWORKS AND NEURAL LANG UAGE MODELS
(a) (b)
Figure7.3 ThetanhandReLUactivationfunctions.
Theseactivation functionshave differentpropertiesthat make themusefulfor
differentlanguageapplicationsornetwork architectures.Forexample,thetanhfunc-
tion has the nice propertiesof beingsmoothlydifferentiableandmappingoutlier
valuestowardthemean.Therectiﬁerfunction,ontheotherhandhasniceproperties
thatresultfrom it beingvery closeto linear. In thesigmoidor tanhfunctions,very
high valuesof z resultin valuesof y that aresaturated, i.e., extremelycloseto 1,saturated
andhave derivativesvery closeto 0. Zeroderivativescauseproblemsfor learning,
becauseaswe’ll seein Section7.4, we’ll train networks by propagating an error
signalbackwards,multiplying gradients(partialderivatives)from eachlayerof the
network; gradientsthatarealmost0 causetheerrorsignalto getsmallerandsmaller
until it is toosmallto beusedfor training,aproblemcalledthevanishing gradientvanishinggradient
problem.Rectiﬁersdon’t have this problem,sincethederivative of ReLU for high
valuesof z is 1 ratherthanvery closeto 0.
7.2 TheXOR problem
Early in thehistoryof neuralnetworksit wasrealizedthatthepower of neuralnet-
works, as with the real neuronsthat inspiredthem, comesfrom combiningthese
unitsinto largernetworks.
Oneof themostcleverdemonstrationsof theneedfor multi-layernetworkswas
the proof by Minsky and Papert(1969) that a single neuralunit cannotcompute
somevery simplefunctionsof its input. Considerthetaskof computingelementary
logical functionsof two inputs,like AND, OR, andXOR. As a reminder, hereare
thetruthtablesfor thosefunctions:
AND OR XOR
x1 x2 y x1 x2 y x1 x2 y
00 00 0 00 0 0
01 00 1 10 1 1
10 01 0 11 0 1
11 11 1 11 1 0
This examplewasﬁrst shown for theperceptron, whichis avery simpleneuralperceptron
unit thathasabinaryoutputanddoesnot haveanon-linearactivationfunction.The
14

---

## Slide / Page 15

Perceptrons
• A very simple neural unit
• Binary output  (0 or 1)
• No non-linear activation function
15

---

## Slide / Page 16

Easy to build AND or OR with
perceptrons
AND OR
4 CHA PTER 7 • NEURAL NETWORKS AND NEURAL LANG UAGE MODELS
(a) (b)
Figure7.3 ThetanhandReLUactivationfunctions.
Theseactivation functionshave differentpropertiesthat make themusefulfor
differentlanguageapplicationsornetwork architectures.Forexample,thetanhfunc-
tion has the nice propertiesof beingsmoothlydifferentiableandmappingoutlier
valuestowardthemean.Therectiﬁerfunction,ontheotherhandhasniceproperties
thatresultfrom it beingvery closeto linear. In thesigmoidor tanhfunctions,very
high valuesof z resultin valuesof y that aresaturated, i.e., extremelycloseto 1,saturated
andhave derivativesvery closeto 0. Zeroderivativescauseproblemsfor learning,
becauseaswe’ll seein Section7.4, we’ll train networks by propagating an error
signalbackwards,multiplying gradients(partialderivatives)from eachlayerof the
network; gradientsthatarealmost0 causetheerrorsignalto getsmallerandsmaller
until it is toosmallto beusedfor training,aproblemcalledthevanishing gradientvanishinggradient
problem.Rectiﬁersdon’t have this problem,sincethederivative of ReLU for high
valuesof z is 1 ratherthanvery closeto 0.
7.2 TheXOR problem
Early in thehistoryof neuralnetworksit wasrealizedthatthepower of neuralnet-
works, as with the real neuronsthat inspiredthem, comesfrom combiningthese
unitsinto largernetworks.
Oneof themostcleverdemonstrationsof theneedfor multi-layernetworkswas
the proof by Minsky and Papert(1969) that a single neuralunit cannotcompute
somevery simplefunctionsof its input. Considerthetaskof computingelementary
logical functionsof two inputs,like AND, OR, andXOR. As a reminder, hereare
thetruthtablesfor thosefunctions:
AND OR XOR
x1 x2 y x1 x2 y x1 x2 y
00 00 0 00 0 0
01 00 1 10 1 1
10 01 0 11 0 1
11 11 1 11 1 0
This examplewasﬁrst shown for theperceptron, whichis avery simpleneuralperceptron
unit thathasabinaryoutputanddoesnot haveanon-linearactivationfunction.The
4 CHA PTER 7 • NEURAL NETWORKS AND NEURAL LANG UAGE MODELS
(a) (b)
Figure7.3 ThetanhandReLUactivationfunctions.
Theseactivation functionshave differentpropertiesthat make themusefulfor
differentlanguageapplicationsornetwork architectures.Forexample,thetanhfunc-
tion has the nice propertiesof beingsmoothlydifferentiableandmappingoutlier
valuestowardthemean.Therectiﬁerfunction,ontheotherhandhasniceproperties
thatresultfrom it beingvery closeto linear. In thesigmoidor tanhfunctions,very
high valuesof z resultin valuesof y that aresaturated, i.e., extremelycloseto 1,saturated
andhave derivativesvery closeto 0. Zeroderivativescauseproblemsfor learning,
becauseaswe’ll seein Section7.4, we’ll train networks by propagating an error
signalbackwards,multiplying gradients(partialderivatives)from eachlayerof the
network; gradientsthatarealmost0 causetheerrorsignalto getsmallerandsmaller
until it is toosmallto beusedfor training,aproblemcalledthevanishing gradientvanishinggradient
problem.Rectiﬁersdon’t have this problem,sincethederivative of ReLU for high
valuesof z is 1 ratherthanvery closeto 0.
7.2 TheXOR problem
Early in thehistoryof neuralnetworksit wasrealizedthatthepower of neuralnet-
works, as with the real neuronsthat inspiredthem, comesfrom combiningthese
unitsinto largernetworks.
Oneof themostcleverdemonstrationsof theneedfor multi-layernetworkswas
the proof by Minsky and Papert(1969) that a single neuralunit cannotcompute
somevery simplefunctionsof its input. Considerthetaskof computingelementary
logical functionsof two inputs,like AND, OR, andXOR. As a reminder, hereare
thetruthtablesfor thosefunctions:
AND OR XOR
x1 x2 y x1 x2 y x1 x2 y
00 00 0 00 0 0
01 00 1 10 1 1
10 01 0 11 0 1
11 11 1 11 1 0
This examplewasﬁrst shown for theperceptron, whichis avery simpleneuralperceptron
unit thathasabinaryoutputanddoesnot haveanon-linearactivationfunction.The
16

---

## Slide / Page 17

XOR & perceptrons
• Not possible to capture XOR with
perceptrons
• Try for yourself!
17

---

## Slide / Page 18

Why?
• Perceptrons are linear classifiers
• Perceptron equation given x1 and x2, is the
equation of a line
w1x1 + w2x2 + b = 0
• (in standard linear format: x2 = (−w1/w2)x1 + (−b/w2))
• This line acts as a decision boundary
0 if input is on one side of the line
1 if on the other side of the line
18

---

## Slide / Page 19

Decision boundaries
0
0 1
1
x1
x2
0
0 1
1
x1
x2
0
0 1
1
x1
x2
a)  x1 AND x2 b)  x1 OR x2 c)  x1 XOR x2
?
XOR is not a linearly separable function!
19

---

## Slide / Page 20

Solution to the XOR problem
• XOR can't be calculated by a single
perceptron
• XOR can be calculated by a layered
network of units.
x1 x2
h1 h2
y1
+1
1 -11 1
1 -2
01
+1
0
4 CHA PTER 7 • NEURAL NETWORKS AND NEURAL LANG UAGE MODELS
(a) (b)
Figure7.3 ThetanhandReLUactivationfunctions.
Theseactivation functionshave differentpropertiesthat make themusefulfor
differentlanguageapplicationsornetwork architectures.Forexample,thetanhfunc-
tion has the nice propertiesof beingsmoothlydifferentiableandmappingoutlier
valuestowardthemean.Therectiﬁerfunction,ontheotherhandhasniceproperties
thatresultfrom it beingvery closeto linear. In thesigmoidor tanhfunctions,very
high valuesof z resultin valuesof y that aresaturated, i.e., extremelycloseto 1,saturated
andhave derivativesvery closeto 0. Zeroderivativescauseproblemsfor learning,
becauseaswe’ll seein Section7.4, we’ll train networks by propagating an error
signalbackwards,multiplying gradients(partialderivatives)from eachlayerof the
network; gradientsthatarealmost0 causetheerrorsignalto getsmallerandsmaller
until it is toosmallto beusedfor training,aproblemcalledthevanishing gradientvanishinggradient
problem.Rectiﬁersdon’t have this problem,sincethederivative of ReLU for high
valuesof z is 1 ratherthanvery closeto 0.
7.2 TheXOR problem
Early in thehistoryof neuralnetworksit wasrealizedthatthepower of neuralnet-
works, as with the real neuronsthat inspiredthem, comesfrom combiningthese
unitsinto largernetworks.
Oneof themostcleverdemonstrationsof theneedfor multi-layernetworkswas
the proof by Minsky and Papert(1969) that a single neuralunit cannotcompute
somevery simplefunctionsof its input. Considerthetaskof computingelementary
logical functionsof two inputs,like AND, OR, andXOR. As a reminder, hereare
thetruthtablesfor thosefunctions:
AND OR XOR
x1 x2 y x1 x2 y x1 x2 y
00 00 0 00 0 0
01 00 1 10 1 1
10 01 0 11 0 1
11 11 1 11 1 0
This examplewasﬁrst shown for theperceptron, whichis avery simpleneuralperceptron
unit thathasabinaryoutputanddoesnot haveanon-linearactivationfunction.The
ReLU
ReLU
20

---

## Slide / Page 21

The hidden representation h
0
0 1
1
x1
x2
a) The original x space
0
0 1
1
h1
h2
2
b) The new (linearly separable) h space
x1 x2
h1 h2
y1
+1
1 -11 1
1 -2
01
+1
0
(With learning:  hidden layers will learn to form useful representations)
21

---

## Slide / Page 22

Feedforward Neural Networks
(Material from ML: Individual Reading)

---

## Slide / Page 23

Feedforward Neural Networks
• Can also be called multi-layer
perceptrons (or MLPs)  for historical
reasons
23

---

## Slide / Page 24

Binary Logistic Regression as a 1-
layer Network
24
w
xnx
1
𝑦 = 𝜎(𝑤 ∙ 𝑥 + 𝑏)
+
1
w1 wn b
(y is a scalar)
σOutput layer
(σ node)
Input layer
vector x
(we don't count the input layer in counting layers!)
(vector)
(scalar)

---

## Slide / Page 25

Multinomial Logistic Regression as a
1-layer Network
25
W
xnx1
Fully connected single layer network
W is a
matrix
𝑦 = softmax(𝑊𝑥 + 𝑏)
+1
y is a vector
y1 yn
b is a vector
b
s s sOutput layer
(softmax
nodes)
Input layer
scalars

---

## Slide / Page 26

Reminder: softmax: a
generalization of sigmoid
• For a vector z of dimensionality k, the
softmax is:
• Example:
26

---

## Slide / Page 27

Two-Layer Network with
scalar output
U
W
xnx1
+1
y is a
scalar
b
hidden units
(σ nodes)
Input layer
(vector)
Output
layer
(σ node)
Could be ReLU
Or tanh
z = 𝑈ℎ
𝑦 = 𝜎(𝑧)
27

---

## Slide / Page 28

Two-Layer Network with
scalar output
U
W
xnx1
+1
b
hidden units
(σ node)
Input layer
(vector)
Output
layer
(σ node)
i
j
Wji
vector
y is a scalar
z = 𝑈ℎ
𝑦 = 𝜎(𝑧)
28

---

## Slide / Page 29

Two-Layer Network with
scalar output
U
W
xnx1
+1
b
hidden units
(σ node)
Input layer
(vector)
Output
layer
(σ node)
Could be ReLU
Or tanh
y is a
scalarz = 𝑈ℎ𝑦 = 𝜎(𝑧)
29

---

## Slide / Page 30

Two-Layer Network with
softmax output
U
W
xnx1
+1
b
hidden units
(σ node)
Input layer
(vector)
Output
layer
(σ node)
Could be ReLU
or tanh
y is a vector
z = 𝑈ℎ
𝑦 = softmax(𝑧)
30

---

## Slide / Page 31

Multi-layer Notation
W[1
]
xnx1 +1
b[1]
i
j
W[2
] b[2]
𝑧[1] = 𝑊[1]𝑎[0] + 𝑏[1]
𝑎[0]
𝑎[1] = 𝑔 1 (𝑧 1 )
𝑧[2] = 𝑊[2]𝑎[1] + 𝑏[2]
𝑎[2] = 𝑔 2 (𝑧 2 )
𝑦 = 𝑎[2]
sigmoid or softmax
ReLU
31

---

## Slide / Page 32

Multi Layer Notation
32
x1 x2 x3
y
w1 w2 w3
∑
b
σ
+1
z
a

---

## Slide / Page 33

Replacing the bias unit
• Let's switch to a notation without the bias
unit
• Just a notational change
1. Add a dummy node a0=1 to each layer
2. Its weight w0 will be the bias
3. So input layer a[0]0=1,
 And a[1]0=1 , a[2]0=1,…
33

---

## Slide / Page 34

Replacing the bias unit
• Instead of: We'll do
this:
x= x1, x2, …, xn0 x= x0, x1, x2, …, xn0
34

---

## Slide / Page 35

Replacing the bias unit
x1 x2
y1
xn0…
…
+1
b
…
U
W
y2 yn2
h1 h2 h3 hn1
x1 x2
y1
xn0…
…
x0=1
…
U
W
y2 yn2
h1 h2 h3 hn1
Instead of: We'll do this:
35

---

## Slide / Page 36

Applying Feedforward Neural
Networks to NLP Tasks

---

## Slide / Page 37

Use cases for feedforward
networks
• Let's consider 2 (simplified) sample
tasks:
1. Text classification
2. Language modeling
• State of the art systems use more
powerful neural architectures, but simple
models are useful to consider!
37

---

## Slide / Page 38

Classification: Sentiment Analysis
• We could do exactly what we did with
logistic regression
• Input layer: binary features as before
• Output layer is 0 or 1
U
W
xnx1
σ
38

---

## Slide / Page 39

Sentiment Features
39

---

## Slide / Page 40

Feedforward nets for simple
classification
• Just adding a hidden layer to logistic regression
• allows the network to use non-linear interactions
between features
• could already improve performance (or not).
40
U
W
x
n
x1
f1 f2 fn
40
W
x
n
x1
f1 f2 fn
Logistic
Regression
2-layer
feedforward
network
σ
σ

---

## Slide / Page 41

41
Neural Net Classification with hand-built
(Input) Features!
FF net. SA using hand-built features of the input text

---

## Slide / Page 42

Even better: representation learning
• The real power of deep
learning comes from the
ability to learn features
from the data
 Instead of using hand-built
human-engineered
features as input to the
classifier
 Use learned word
representations (like
word2vec or GloVe) as
embeddings!
42
U
W
xnx1
e1 e2 en
σ

---

## Slide / Page 43

Issue: texts come in different sizes
• Some simple solutions (more sophisticated ones later):
1. Make input length = that of the longest review/doc.
• If shorter then pad with zero embeddings
• Truncate if you get longer reviews at test time
2. Apply some sort of a pooling function to the
embeddings of the words:
• E.g. for a text/sentence with n input words/tokens w1, …
, wn, turn the n embeddings e(w1), … , e(wn) (each of
dimensionality d) into a single d-dimension embedding
by:
 summing the embeddings, or
 taking their mean:  𝑥𝑚𝑒𝑎𝑛 =
1
𝑛 σ𝑖=1𝑛 𝑒(𝑤𝑖) or
 taking their element-wise max. 43

---

## Slide / Page 44

Neural Net Classification with
Embeddings as Input Features!
• Assuming mean pooling of the
embeddings and a single example, the
equations for the classifier are:
x = mean(e(w1), … , e(wn))
h = σ(W.x+b)
z = U.h
ŷ = softmax(z)
44

---

## Slide / Page 45

45
Neural Net Classification with
Embeddings as Input Features!
FF net. SA using a pooled embedding of the input words

---

## Slide / Page 46

classifying an entire test set of examples
• Use matrix multiplication to do the computation
of an entire test set at once.
 For each input x, pack all the input feature vectors
into a single input matrix X, with each row i a row
vector consisting of the pooled embedding for input
example x(i).
 For m examples, X is of shape [m x d] and W is of
shape [dh x d]; W is transposed
 product will give a matrix   [m x dh].
 Bias vector b of shape [1xdh] is replicated into a
matrix of shape [mxdh].
 Output matrix Ŷ is [m x 3] (or more generally
[m x do], where do is the number of output classes),
46

---

## Slide / Page 47

Output class distribution for a set of
examples
H = σ (X WT + b)
Z = U H
Ŷ = softmax(Z)
• Pretraining: The idea of using word2vec or GloVe
embeddings as input representation — and more
generally the idea of relying on another algorithm
to have already learned an embedding
representation for our input words.
• Using static embeddings like word2vec or more
powerful contextual embeddings (Chap. 11), is one
of the central ideas of deep learning.
47

---

## Slide / Page 48

Feedforward Neural Language
Modeling

---

## Slide / Page 49

Neural Language Models
• Language Modeling: Calculating the
probability of the next word in a sequence
given some history.
• We've seen N-gram based LMs
• But neural network LMs far outperform n-
gram language models
• State-of-the-art neural LMs are based on
more powerful neural network technology like
Transformers (Upcoming chapter).
•But simple feedforward Neural LMs can
do almost as well!
49

---

## Slide / Page 50

N-gram models vs. neural LMs
• Neural LMs can
 handle much longer histories,
 can generalize better over contexts of similar
words, and
 are more accurate at word-prediction.
• But neural net LMs are
 much more complex,
 slower and need more energy to train, and
 less interpretable than n-gram models.
• So for some smaller tasks n-gram LMs are
still the right tool.
50

---

## Slide / Page 51

Simple FF Neural Language Models
• A FF neural LM is a FF net that
takes as input at time t a
representation of some number of
previous words (wt-1 , wt-2  , …) and
outputs a probability distribution over
possible next words.
51

---

## Slide / Page 52

Simple FF Neural Language Models
• Task: At each timestep t predict proba. of next
word wt given prior words wt-1, wt-2, wt-3, …
• Problem: We are now dealing with sequences of
arbitrary length.
• Solution: Use sliding windows (of fixed length)
• i.e. the FF neural LM approximates the probability
of a word given the entire prior context P(wt |w1:t-1)
by approximating based on the N – 1 previous
words.
52

---

## Slide / Page 53

Simple FF Neural LMs (NLMs)
• Example: we will use a 4-gram case, so
we’ll show a neural net to estimate the
probability P(wt = i| wt-3, wt-2, wt-1).
• NLMs represent words in this prior context
by their embeddings, rather than just by
their word identity as used in n-gram LMs.
• This allows them to generalize better to
unseen data.
53

---

## Slide / Page 54

Why Neural LMs work better than
N-gram LMs
• Suppose:
• Training data:
 We've seen:
I have to make sure that the cat gets fed.
 Never seen:   dog gets fed
• Test data:
 I forgot to make sure that the dog gets ___
 N-gram LMs can't predict "fed"!
 Neural LMs can use similarity of "cat" and "dog"
embeddings to generalize and predict “fed” after
dog
54

---

## Slide / Page 55

Forward inference in a FF NLM
• Forward inference: given an input, run a
forward pass on the network to produce a
probability distribution over possible outputs, in
this case next words.
1. Represent each of the N previous words as a
one-hot vector of length |V|.
2. Multiply these one-hot vectors by the
embedding matrix E.
 E has a column for each word, each being a
column vector of d dimensions
 E has dimensionality d x |V|
55

---

## Slide / Page 56

Forward inference in a FF NLM
56
Multiplying by a one-hot vector that has only one
non-zero element xi = 1 simply selects the relevant
column vector for word i, resulting in the embedding
for word i.
The 3 resulting embedding vectors are concatenated
to produce e, the embedding layer. Size 3d x 1

---

## Slide / Page 57

57

---

## Slide / Page 58

58

---

## Slide / Page 59

Example
• Y42 (value of output node 42): probability of the next word wt
being V42, the vocabulary word with index 42 (the word ‘fish’ in
this case)
1. Select three embeddings from E :
 Given the three previous words, look up their indices, create
3 one-hot vectors, and then multiply each by the
embedding matrix E.
 Consider wt-3, one-hot vector for ‘for ’ (index 35) is
multiplied by the embedding matrix E, to give the first part
of the first hidden layer, the embedding layer
• Recall: - each column of the input matrix E is an embedding for a word, &
- the input is a one-hot column vector xi for word Vi,
 embedding layer for input w will be Exi = ei, the embedding for
word i.
 Concatenating the 3 embeddings for the 3 context words we get the
embedding layer e. 59

---

## Slide / Page 60

Example (cont.)
2. Multiply by W (and add b) and pass
through the ReLU (or other) activation
function to get the hidden layer h.
3. Multiply h by U
4. Apply softmax: After the softmax, each
node i in the output layer estimates the
probability P(wt = i| wt-3, wt-2, wt-1).
60

---

## Slide / Page 61

Summary Equations
• The equations for a NLM with a window
size of 3, given one-hot input vectors for
each input context word, are:
• e = [E xt-3; E xt-2; E xt-1]
# concatenation of 3 embeddings
• h = σ(We+b)
• z = Uh
• ŷ = softmax(z)
61

---

## Slide / Page 62

Training Neural Nets: Overview
(Material from ML: Individual Reading)

---

## Slide / Page 63

Intuition: training a 2-layer
Network
63
U
W
xnx1
System output ො𝑦
Actual answer 𝑦
Training instance
Loss function L( ො𝑦, 𝑦)
Forward pass
Backward pass

---

## Slide / Page 64

Intuition: Training a 2-layer network
• For every training tuple (𝑥, 𝑦)
 Run forward computation to find our estimate ො𝑦
 Run backward computation to update weights:
 For every output node
 Compute loss 𝐿 between true 𝑦 and the estimated ො𝑦
 For every weight 𝑤 from hidden layer to the output
layer
 Update the weight
 For every hidden node
 Assess how much blame it deserves for the current
answer
 For every weight 𝑤 from input layer to the hidden layer
 Update the weight
64

---

## Slide / Page 65

Reminder: Loss Function for binary
logistic regression
• A measure for how far off the current
answer is to the right answer
• Cross entropy loss for logistic regression:
65

---

## Slide / Page 66

Reminder: gradient descent
for weight updates
• Use the derivative of the loss function
with respect to weights 𝑑𝑑𝑤 𝐿(𝑓 𝑥; 𝑤 , 𝑦)
• To tell us how to adjust weights for each
training item
 Move them in the opposite direction of the
gradient
 For logistic regression
10 CHA PTER 5 • LOGISTIC REGRESSION
example):
wt+ 1 = wt − h ddwL( f (x; w), y) (5.14)
Nowlet’s extendtheintuitionfrom a functionof onescalarvariablew to many
variables,becausewedon’t justwantto move left or right,wewantto know where
in theN-dimensionalspace(of theN parametersthatmake up q) weshouldmove.
Thegradient is just sucha vector;it expressesthedirectionalcomponentsof the
sharpestslopealongeachof thoseN dimensions.If we’rejustimaginingtwo weight
dimensions(say for oneweightwandonebiasb), thegradientmightbeavectorwith
two orthogonalcomponents,eachof whichtellsushow muchthegroundslopesin
thew dimensionandin theb dimension.Fig. 5.4 showsavisualizationof thevalue
of a2-dimensionalgradientvectortakenattheredpoint.
Cost(w,b)
w b
Figure5.4 Visualizationof thegradientvectorattheredpointin two dimensionsw andb,
showing thegradientasaredarrow in thex-y plane.
In anactuallogisticregression,theparametervectorw is muchlongerthan1 or
2, sincetheinput featurevectorx canbequitelong, andwe needa weightwi for
eachxi. For eachdimension/variablewi in w (plusthebiasb), thegradientwill have
a componentthattells ustheslopewith respectto thatvariable.Essentiallywe’re
asking:“How muchwouldasmall changein thatvariablewi inﬂuencethetotalloss
functionL?”
In eachdimensionwi, weexpresstheslopeasapartialderivative ∂∂ wi of thelossfunction.Thegradientis thendeﬁnedasavectorof thesepartials.We’ll representˆy
as f (x;q) to makethedependenceon q moreobvious:
—qL( f(x; q),y)) =
2
66664
∂
∂ w1 L( f(x; q),y)∂
∂ w2 L( f(x; q),y)...
∂
∂ wn L( f(x; q),y)
3
77775 (5.15)
Theﬁnal equationfor updatingq basedonthegradientis thus
qt+ 1 = qt − h—L( f(x; q),y) (5.16)
66

---

## Slide / Page 67

Derivative of a composition of functions
• Using the chain rule!   f (x) = u(v(x))
• Intuition (see the text for details)
67
x1 x2 x3
y
w1 w2 w3
∑
b
σ
+1
z
a
Derivative of the Loss
Derivative of the Activation
Derivative of the weighted sum
𝜕𝐿
𝜕𝑤𝑖
=
𝜕𝐿
𝜕𝑦
𝜕𝑦
𝜕𝑧
𝜕𝑧
𝜕𝑤𝑖

---

## Slide / Page 68

Finding the gradient for every weight
in the network
• These derivatives on the prior slide only
give the updates for one weight layer: the
last one!
• What about deeper networks?
• Lots of layers, different activation
functions?
• Solution in the next lecture:
• Even more use of the chain rule!!
• Computation graphs and backward
differentiation!
68

---

## Slide / Page 69

Computation Graphs and Backward
Differentiation/ Backpropagation
(Basic ML material: individual reading)

---

## Slide / Page 70

Why Computation Graphs
• For training, we need the derivative of the
loss with respect to each weight in every
layer of the network
• But the loss is computed only at the very
end of the network!
• Solution: error backpropagation (Rumelhart,
Hinton, Williams, 1986)
• Backprop is a special case of backward
differentiation
• Which relies on computation graphs.
70

---

## Slide / Page 71

Computation Graphs
• A computation graph represents the
process of computing a mathematical
expression
71

---

## Slide / Page 72

Example:
72
e=a+d
d = 2b L=ce
a
b
c
Computations:

---

## Slide / Page 73

Example:
73
Computations:

---

## Slide / Page 74

Backwards differentiation in
computation graphs
• The importance of the computation graph
comes from the backward pass
• This is used to compute the derivatives that
we’ll need for the weight update.
74

---

## Slide / Page 75

Example
75
The derivative
𝜕𝐿
𝜕𝑎, tells us how much a small change in
a affects L.
We want:
7.4 • TRAI NING NEURAL NETS 13
Orfor ane tworkwith onehidde nla ye ra ndsoftma xoutput,wecouldusethede riva-
tiveof thesoftma xlossfromEq.??:
∂ LCE
∂ wk
=( { y = k} − p(y = k|x))xk
=
{ y = k} − exp(wk ·x+ bk)P K
j= 1exp(wj ·x+ bj)
!
xk (7.22)
But the sede riva tivesonly give corre ctupda te sfor onewe ightla ye r:thela stone !
Forde e pne tworks,computingthegra die ntsfor e a chwe ightis muchmorecomplex,
sincewea recomputingthede riva tivewith re spe ctto we ightpa ra me te rstha ta ppe a r
a llthe way ba ckin theve rye a rlyla ye rsof thene twork, even thoughthe lossis
compute donlyattheve rye ndof thene twork.
Thesolutionto computingthisgra die ntis ana lgorithmca lle de rror backprop-
agationor backprop (Rume lha rtet a l.,1986). While ba ckpropwasinve nte dspe -e rror back-propagation
cia llyfor ne ura lne tworks,it turnsoutto bethesa measa morege ne ra lproce dure
ca lle dbackward diffe re ntiation, which de pe ndson the notionof computation
graphs.Let’sse ehow tha tworksin thenext subse ction.
7.4.3 ComputationGraphs
A computa tiongra phisare pre se nta tionof theproce ssof computingama the ma tica l
expre ssion,in whichthecomputa tionis brokendown intose para teope ra tions,e a ch
of whichis mode le dasanodein agra ph.
Conside rcomputingthefunctionL(a,b,c)= c(a+ 2b). If wema kee a chof the
compone nta dditiona ndmultiplica tionope ra tionsexplicit, a nda ddna me s(d a nde)
for theinte rme dia teoutputs,there sultingse rie sof computa tionsis:
d = 2⇤b
e = a+ d
L = c⇤e
We ca nnow re pre se ntthis asa gra ph,with node sfor e a chope ra tion,a nddi-
re cte de dge sshowing theoutputsfrom e a chope ra tionastheinputsto thenext, as
in Fig. 7.10. Thesimple stuseof computa tiongra phsis to computetheva lueof
thefunctionwith somegiveninputs.In theﬁgure,we’vea ssume dtheinputsa = 3,
b = 1, c = − 2, a ndwe’ve shown there sultof theforward passto computethere -
sultL(3,1,− 2)= − 10. In theforwa rdpa ssof acomputa tiongra ph,wea pplye a ch
ope ra tionle ftto right, pa ssingtheoutputsof e a chcomputa tionastheinputto the
next node .
7.4.4 Backwarddiffe re ntiationon computationgraphs
Theimporta nceof thecomputa tiongra phcome sfrom thebackward pass, which
is use dto computethe de riva tivestha twe’ll ne e dfor the we ightupda te .In this
exa mpleourgoa lis to computethede riva tive of theoutputfunctionL with re spe ct
to e a chof theinputva ria ble s,i.e .,∂ L∂ a, ∂ L∂ b, a nd∂L∂ c. Thede riva tive ∂ L∂ a, tells ushow
muchasma llcha ngein a affe ctsL.
Ba ckwa rdsdiffe re ntia tionma kesuseof thechainrule in ca lculus. S upposewechainrule
a recomputingthede riva tiveof acompositefunctionf(x)= u(v(x)). Thede riva tive

---

## Slide / Page 76

The chain rule
• Computing the derivative of a composite
function:
• f (x) = u(v(x))
• f (x) = u(v(w(x)))
76

---

## Slide / Page 77

Example
77

---

## Slide / Page 78

Example
78

---

## Slide / Page 79

Example
79

---

## Slide / Page 80

Example
80

---

## Slide / Page 81

Backward differentiation on a
2-layer network
81
σ
W[2]
W[1]
y
x2x1
Sigmoid activation
ReLU activation
1
1
b[1]
b[2]

---

## Slide / Page 82

Backward differentiation on a
2-layer network
82

---

## Slide / Page 83

Backward differentiation on a
2-layer network
83

---

## Slide / Page 84

Starting off the backward pass:
𝜕𝐿
𝜕𝑧
(We'll write 𝑎 for 𝑎[2] and 𝑧 for 𝑧[2] )
𝐿 ො𝑦, 𝑦 = − y log( ො𝑦) + 1 − 𝑦 log(1 − ො𝑦)
𝐿 𝑎, 𝑦 = − y log 𝑎 + 1 − 𝑦 log(1 − 𝑎)
𝜕𝐿
𝜕𝑧 =
𝜕𝐿
𝜕𝑎
𝜕𝑎
𝜕𝑧
𝜕𝐿
𝜕𝑎 = − 𝑦 𝜕 log 𝑎𝜕𝑎 + (1 − y) 𝜕 log 1 − 𝑎𝜕𝑎
= − 𝑦 1𝑎 + 1 − y 11 − 𝑎 −1 = − 𝑦𝑎 + 𝑦 − 11 − 𝑎
𝜕𝑎
𝜕𝑧 = 𝑎(1 − 𝑎) 𝜕𝐿𝜕𝑧 = − 𝑦𝑎 + 𝑦 − 11 − 𝑎 𝑎 1 − 𝑎 = a − y
84

---

## Slide / Page 85

Summary
• For training, we need the derivative of the
loss with respect to weights in early layers of
the network
• But loss is computed only at the very end of
the network!
• Solution: backward differentiation
(Backpropagation)
• Given a computation graph and the
derivatives of all the functions in, it we can
automatically compute the derivative of the
loss with respect to these early weights.
85

---

## Slide / Page 86

Textbook
Jurafsky, D. and Martin, J.H. (2024) Speech and Language
Processing: An Introduction to Natural Language Processing,
Computational Linguistics, and Speech Recognition with
Language Models (3rd ed. draft), Prentice Hall.
https://web.stanford.edu/~jurafsky/slp3/ed3bookaug20_2024.pdf
86
The draft version of the 3rd edition
will be used; it has been updated to
include more recent topics such as
Vector Semantics and Embeddings,
ANNs and Deep Learning for NLP,
Transformers, etc.
This course slides are largely
based on this textbook and its
authors’ slides with light
customisations whenever seen fit.

---

