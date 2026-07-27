const fs = require('fs');
const path = require('path');

const rawData = `Timestamp	Full Name	Email Address	WhatsApp Number	Current Occupation	Primary Skill	Reason	Referral
2026-07-03T23:07:39.325Z	Ampong Ernest Agyemang 	ernestampong316@gmail.com	+233599092984	Student	All of the above	To be equipped with skills as far as technology is concerned in our modern world 	WhatsApp
2026-07-03T23:32:00.307Z	Benjamin Asamoah 	asamoahbenjamin83@gmail.com	+233246365243	Student	All of the above	To be equipped with the necessary skills and expertise to learn and grow in the field of website development and it’s improvement. 	WhatsApp
2026-07-03T23:43:51.589Z	Annn Kiki	annalisakitcher679@gmail.com	+233503647006	Student	All of the above	To build … with the lot of ideas I have	WhatsApp
2026-07-03T23:54:08.557Z	Emmanuel Sarfo Kantanka 	sarfoe3221@gmail.com	+233536051702	Student	All of the above	I want to upgrade my skills in the field of AI. 	WhatsApp
2026-07-04T00:49:08.145Z	Emmanuella Asiedu 	e23564668@gmail.com	+233246134452	Student	Everything	Commitment: Fully Committed | Company: Knust | Country: Ghana	WhatsApp
2026-07-04T00:49:41.911Z	Opoku Richmond 	opokurichmond2082@gmail.com	+233240850825	Student	Android Apps	Commitment: Interested | Company: Kwame Nkrumah University of Science and Technology  | Country: Ghana 	WhatsApp
2026-07-04T00:50:57.564Z	Anthony Norkplim Dzormenyo	dzormenyoanthony@gmail.com	+233534251226	Freelancer	UI/UX Design	Commitment: Fully Committed | Company: knust | Country: Ghana	Twitter/X
2026-07-04T01:52:22.929Z	Mohammed Abdul Gaffar 	mabdulgaffar18@gmail.com	+233530389927	Student	AI Prompt Engineering	Commitment: Fully Committed | Company: Kwame Nkrumah University of science and technology  | Country: Ghana 	WhatsApp
2026-07-04T06:50:21.702Z	NKRUMAH DANIEL MENSAH 	nkrumahdan06@gmail.com	+233547298442	Student	Everything	Commitment: Fully Committed | Company: UENR | Country: Ghana	WhatsApp
2026-07-04T08:44:27.060Z	Ludwig Siisi Ben-Acquaah	benacquaahludwig@gmail.com	+233558154988	Student	Everything	Commitment: Fully Committed | Company: Kwame Nkrumah University of Science and Technology  | Country: Ghana	WhatsApp
2026-07-04T10:36:25.385Z	Adjetey-London Elroi Naa Atswei	elroilondon06@gmail.com	+233554702675	Student	Websites	Commitment: Fully Committed | Company: School | Country: Ghana	WhatsApp
2026-07-04T10:42:05.049Z	Joel Nhyira Banafo	nhyirabanafo@gmail.com	+233597469213	Student	Everything	Commitment: Fully Committed | Company: KWAME NKRUMAH UNIVERSITY OF SCIENCE AND TECHNOLOGY  | Country: Ghana	Friend
2026-07-04T10:51:59.216Z	Godly Tettey Kumah	godlytettey640@gmail.com	+233268556809	Student	AI Productivity	Saw the works of one your team leads and I was impressed. I want to at least learn something and be good at it before I leave school, specifically AI.	WhatsApp
2026-07-04T11:12:38.167Z	Abban Joshua Ewudzie 	joshuabban504@gmail.com	+233594794850	Student	Android Apps	Commitment: Fully Committed | Company: School  | Country: Ghana	Friend
2026-07-04T11:42:45.544Z	CLIFFORD DONKOR	donkorclifford0510@gmail.com	+233246023579	Student	AI Prompt Engineering	Commitment: Fully Committed | Company: Kwame Nkrumah University of Science and Technology  | Country: Ghana	Other
2026-07-04T12:03:35.316Z	Sheila Osei Agyemang	oseiagyemangsheila80@gmail.com	+233556778782	Student	All of the above	My goal is to gain hands on experience, build impactful projects, and use technology to create positive change in any space I find myself 	WhatsApp
2026-07-04T12:16:36.626Z	Richmond Bortey	rbortey89@gmail.com	+233532807428	Student	All of the above	Because I want to learn more about Ai and building websites 	WhatsApp
2026-07-04T12:24:22.025Z	Kevin David Pappoe	kevindpappoe@gmail.com	+233200784799	Student	Everything	Commitment: Interested | Company: KWAME NKRUMAH UNIVERSITY OF SCIENCE AND TECHNOLOGY | Country: Ghana	WhatsApp
2026-07-04T12:25:54.785Z	BAFFOUR MICHAEL GYIMAH	michaelbaffour887@gmail.com	+233597041387	Student	Android Apps	Commitment: Fully Committed | Company: KNUST | Country: GHANA	WhatsApp
2026-07-04T12:26:34.514Z	Prisca Ametepe	priscaametepe15@gmail.com	+447412276212	Student	Website Development	Want to know more 	Friend
2026-07-04T12:26:50.817Z	Benjamin Owusu Amusah	benjaminamusah156@gmail.com	+233533255330	Student	Everything	Commitment: Interested | Company: KNUST | Country: Ghana	WhatsApp
2026-07-04T12:28:22.149Z	Twumasi Michael Ofosu 	boatenghagar336@gmail.com	+233245472327	Student	All of the above	Sounds good	Friend
2026-07-04T12:27:20.115Z	Ginsberg Sefah Somuah 	ginsbergsefah33@gmail.com	+233504559424	Student	All of the above	To get enough knowledge in how to use AI tools and to apply it in my field of study to solve real world problems	WhatsApp
2026-07-04T12:30:03.705Z	Emmanuel Elikplim Atinyuie	emmanuelelikplim091@gmail.com	+233558533116	Entrepreneur	Android App Development	To gain traction on mobile app dev	Friend
2026-07-04T12:30:21.200Z	Sabadu Nathaniel Awoenam 	Nsabadu1@gmail.com	+233547735109	Student	All of the above	To equip myself with current software development skills to help enhance my academics and future professional skills. 	Friend
2026-07-04T12:34:43.923Z	MOOMIN UBEIDA TANDO	tandoubaida@gmail.com	+233202300662	Student	All of the above	To learn more about AI	Friend
2026-07-04T12:34:56.735Z	Kpodo Kingsley Edem	edemkingsley99@gmail.com	+233534309592	Student	Android App Development	I have skills in web developing already so i would like to enhance it by diving it into andriod app creation because with the ideas and skills in web design and UI/UX design wouldnt be a difficult task for me to learn how to build apps.	WhatsApp
2026-07-04T12:37:36.854Z	Ibrahim A	awuduibrahim177@gmail.com	+233537828674	Student	All of the above	learn software development 	WhatsApp
2026-07-04T12:39:45.875Z	Ahmed Awintuma Alembil	ahmedalembil@gmail.com	+233536789379	Student	All of the above	to learn a lot of full stack dev	Friend
2026-07-04T12:39:56.902Z	Naadei Emmanuella 	naadeiella@gmail.com	+233504539299	Student	AI Productivity	Because I want to acquire knowledge on AI	WhatsApp
2026-07-04T12:48:53.036Z	Nana Kwabena Addo Nyarko 	nanakwabee01@gmail.com	+233503356126	Student	Android App Development	I'm a Robotics and AI engineering student in the University of Mines and Technology who wants to build an app for students to be able to book hostels rather than stressing and walking long distance to book them	Friend
2026-07-04T12:54:50.910Z	Godfred Oheneba Kofi Asare	ohenebakofiasaregodfred@gmail.com	+233532719700	Student	Website Development	My goal in joining this academy is to develop practical skills in building innovative digital products using Artificial Intelligence (AI). I want to learn how to identify real-world problems and design user-centered solutions.	WhatsApp
2026-07-04T13:00:53.345Z	Perfect Nunana Gbedemah	perfectgbedemah370@gmail.com	+233256595189	Student	All of the above	just to learn something new	Other
2026-07-04T13:03:31.606Z	Eliza Nicco-Annan	elizaniccoannan510@gmail.com	+233505677632	Student	Website Development	 I want to join Sena Academy to gain practical tech skills, learn from experienced mentors, and build projects that prepare me for a successful career. I am eager to grow, work hard, and use these skills to create opportunities for myself and my community 	WhatsApp
2026-07-04T13:03:34.175Z	Kevin Ebo Dadzie	kelvindadzie60@gmail.com	+233502332638	Student	Everything	Commitment: Fully Committed | Company: Kwame Nkrumah University of Science and Technology  | Country: Ghana	WhatsApp
2026-07-04T13:06:02.754Z	Ellis Atiadze	ellisataidze@gmail.com	+233543438617	Working Professional	All of the above	Have an in-depth knowledge IT related courses and web development an to maximize the use of AI 	Friend
2026-07-04T13:06:04.279Z	Seth Kwartei Quartey	deitrickquartey06@gmail.com	+233553806514	Student	All of the above	To learn new things in the digital space. 	WhatsApp
2026-07-04T13:08:21.161Z	Austine Nai Ako	austineako001@gmail.com	+233279965259	Student	All of the above	I want to learn how to create apps and build myself	Friend
2026-07-04T13:08:24.410Z	Fia Miriam Fafali	miriamfafalifia@gmail.com	+233545925692	Student	Website Development	To be able to develop tools that will be of beneficial	WhatsApp
2026-07-04T13:12:28.604Z	Eric Ananga	ericsurvival363@gmail.com	+233540295873	Student	Website Development	I want to learn software development	WhatsApp
2026-07-04T13:12:43.407Z	Gilbert Acheampong 	acheamponggilbert65@gmail.com	+233503587224	Student	AI Productivity	To gain an equip knowledge about ai and how to improve productivity with ai	WhatsApp
2026-07-04T13:12:57.808Z	Quainoo Theophilus Adomako	quainootheophilusadomako48@gmail.com	+233535997748	Student	All of the above	To learn, explore and create	WhatsApp
2026-07-04T13:16:22.968Z	Meat dee	dd@gmail.com	+233552843165	Student	All of the above	Shit 	Friend
2026-07-04T13:20:12.088Z	maame ofosua	maafosua44@gmail.com	+233558016653	Student	Everything	Commitment: Just Exploring | Company: self | Country: Ghana	WhatsApp
2026-07-04T13:20:26.069Z	Jessica Eyram 	jessicahadzi6@gmail.com	+233503002820	Student	All of the above	I think it's a great opportunity to learn 	LinkedIn
2026-07-04T13:21:11.456Z	Jessica Eyram Hadzi 	jessicahadzi6@gmail.com	+233503002820	Student	All of the above	I think it's a great opportunity to learn new things 	WhatsApp
2026-07-04T13:22:40.729Z	Michael Oppong Ewusi 	michaelewusi06@gmail.com	+233538580672	Student	All of the above	I want to have these skills to add up to my career skills to increase my value on the job market	Friend
2026-07-04T13:23:25.526Z	Akwasi Toku Osei Effah 	effahakwasi50@gmail.com	+233593602676	Student	All of the above	To learn how to maximise the full potential of AI	WhatsApp
2026-07-04T13:24:48.948Z	Mensah Emmanuella Afiba 	ellafiba456@gmail.com	+233538660632	Student	All of the above	I want to learn	WhatsApp
2026-07-04T13:24:50.616Z	Jeffery Epstein 	iminnocent@jefferyepstein.org	+233123456789	Working Professional	All of the above	Bruh  🤣	Other
2026-07-04T13:30:13.698Z	Racheal Abrams Allotey 	abramsrachael10@gmail.com	+233558442893	Student	AI Productivity	For career growth 	WhatsApp
2026-07-04T13:33:44.158Z	Yedru Justice	jayjustice079@gmail.com	+233274244659	Student	Website Development	I am a Geography student at the University of Ghana, and I want to combine the knowledge from my course with AI and software development to solve real-world problems. I hope to gain practical digital skills that will also help me earn an income and build useful projects.	WhatsApp
2026-07-04T13:44:05.667Z	David Sebiawu	sebiawudavid0@gmail.com	+233203935431	Student	All of the above	I believe there more to Learn from the Academy 	WhatsApp
2026-07-04T13:46:33.711Z	Tsikata Dela Fui Kofi	tsikatadela336@gmail.com	+233541201449	Student	AI Productivity	Gain skills on the efficient use of AI	WhatsApp
2026-07-04T13:55:17.054Z	Korgah Pius	pixarperez02@gmail.com	+233504069570	Student	UI/UX Design	It would help improve my knowledge and build a useful skill	Other
2026-07-04T13:57:25.781Z	Andy Agbotse	andyagbotse2006@gmail.com	+233272020071	Student	All of the above	I want to enhance my knowledge about the usage of AI and make good use of what I can develop with it	Friend
2026-07-04T14:03:52.506Z	Kingsley Ohene Adu	unrullybillionz@gmail.com	+233544883572	Graduate	All of the above	I want to learn how to build websites 	Friend
2026-07-04T14:04:37.563Z	Wonder Rocky	leerawkey@gmail.com	+233256519035	Graduate	All of the above	To improve on my knowledge and use it productively 	WhatsApp
2026-07-04T14:09:37.429Z	Donu Mohammed Jannatul Firdaus	jannatulfirdaus981@gmail.com	+233205554049	Student	Android App Development	To learn a skill	WhatsApp
2026-07-04T14:10:39.534Z	Yenami Kaletor Korku Ameade	yenamiameade@gmail.com	+233247346184	Student	All of the above	I believe that in the ever-increasing potential of technology in making significant contributions to human life, it is essential to learn how to make adequate use of such advancements. As such, I hope to gain knowledge on how to use these tools and apply them in my life and work.	Friend
2026-07-04T14:14:06.600Z	Akafari Meshack 	akafarimeshack7@gmail.com	+233549071603	Student	Website Development	I am aspiring to be a website developer 	WhatsApp
2026-07-04T14:14:39.050Z	Nana Ama Odamea Kokora	susannakokora19@gmail.com	+233552595120	Student	Android App Development	I want to learn how to develop apps that can solve real life challenges in the socio-economic environment.	Friend
2026-07-04T14:19:58.240Z	ALHASSAN ADAMS 	alhassanadams789@gmail.com	+233246036091	Student	Website Development	I'm passionate about using data to solve real world problems, because this program doesn't not entail it I want to acquire more skills 	WhatsApp
2026-07-04T14:25:21.571Z	Salifu Abdul-Kadir	frescoking55@gmail.com	+233509023746	Student	Android App Development	To fully understand how to use AI in android app development. 	WhatsApp
2026-07-04T14:31:59.474Z	Lemuel Kafui	kafuilemuel@gmail.com	+233552827713	Student	Android App Development	I think it's a really great opportunity for me to start learning Tech	WhatsApp
2026-07-04T14:33:04.809Z	Theophilus Ackon 	theophilusackon06@gmail.com	+233595169171	Student	All of the above	To get more knowledge on the use of AI	WhatsApp
2026-07-04T14:34:50.443Z	Robert Kwaw	rpapakyikwaw@gmail.com	+233536212600	Student	All of the above	To gain experiences	Friend
2026-07-04T14:35:45.481Z	Ishmael Gyimah Darkwah	ishmaelgyimah13@gmail.com	+233546996407	Student	Android App Development	y	WhatsApp
2026-07-04T14:36:19.518Z	Collins Millikan 	collinsashiangbor@gmail.com	+233556249238	Student	All of the above	To be more technologier 	LinkedIn
2026-07-04T14:41:08.022Z	Samuel Nsiah Boakye	snsiahboakye76@gmail.com	+233596762825	Student	All of the above	To become innovative and resourceful everywhere i go	WhatsApp
2026-07-04T14:42:40.785Z	Xenya Irene	xenyairene1@gmail.com	+233533430898	Student	Website Development	So I can build websites 	WhatsApp
2026-07-04T14:45:51.289Z	Sylvia Etornam	norgbedzigirl6@icloud.com	+233595048390	Student	AI Productivity	Education 	Friend
2026-07-04T14:46:38.061Z	Adjei Augustine	augustineadjei235@gmail.com	+233257430888	Student	Website Development	I am enthusiastic when it comes to tech and the Internet. Though a student pharmacist, I believe I could bring of differences to the health sector with the use of the right technology to enhance the delivery of better and quality health care. This is why I would like to Join Sena	WhatsApp
2026-07-04T14:48:56.378Z	Ocran Israel Ato	ocranisraelato@gmail.com	+233551505909	Student	All of the above	Learning and innovative purchase 	WhatsApp
2026-07-04T14:50:37.240Z	Douglas Awinseba	douglasawinseba@gmail.com	+233539052261	Student	Everything	Commitment: Interested | Company: KNUST  | Country: Ghana	WhatsApp
2026-07-04T15:14:52.429Z	Mubarick Saliu	saliumubarick@gmail.com	+2335308866052	Student	All of the above	To be able to develop other skill like Android app development and web development that will help me in my future career 	WhatsApp
2026-07-04T15:14:55.196Z	CHRISTOPHER KWEKU AYERTEY	christopherayertey036@gmail.com	+233206493768	Student	All of the above	I wanna be creative in terms of being versatile 	Friend
2026-07-04T15:28:47.385Z	Julius Oppong Asiamah 	sirjuliusoppong@gmail.com	+233530075525	Student	Website Development	I'm much interested in learning to build and improve my Problem solving skills	WhatsApp
2026-07-04T15:33:07.739Z	Daniel Edem Letsu 	danielletsu275@gmail.com	+233549665640	Student	UI/UX Design	I want to learn about UI/UIX design ,having that skills will be really helpful 	Friend
2026-07-04T15:36:39.095Z	Azumah Wumbeidoo Mohammed 	azumahm154@gmail.com	+2335504669899	Student	All of the above	AI video making 	Friend
2026-07-04T22:34:54.950Z	Asolo Ayidatu Seidu 	asoloayidatuseidu@gmail.com	+233533960992	Student	Website Development	I want to be able to develop a website on my own which will also be a stepping stone to my career 	WhatsApp
2026-07-04T15:40:00.797Z	Addo Akwasi Gyasi 	akwasiaddogyasi1819@gmail.com	+233537030718	Student	All of the above	My goal is to have skill in software development to improve my business 	WhatsApp
2026-07-04T15:46:50.805Z	Tsifodze Christabell 	bellacloudless98@gmail.com	+233536694662	Student	All of the above	I want to build a software that will help the unemployed	WhatsApp
2026-07-04T15:53:23.829Z	Hamza cruz lee	odogurich12@gmail.com	+233548395692	Graduate	Android App Development	I want to join this Academy because I think this is the best space or platform that can help me achieve what I ever dreamed to achieve. 	Friend
2026-07-04T16:20:16.570Z	Lawrence Atayi	leolawatayi@gmail.com	+233204744301	Graduate	All of the above	I'll like to venture and use AI better and better to increase productivity 	WhatsApp
2026-07-04T16:22:53.284Z	Ankomah Obrempong	obrempongankomah@gmail.com	+233531183313	Student	UI/UX Design	To discover interesting skills in building myself for the future	WhatsApp
2026-07-04T16:27:22.992Z	Tweneboah Kodua Daniel 	danieltweneboah08@gmail.com	+233599452031	Student	All of the above	To learn, build software, Design products and help the future generations 	WhatsApp
2026-07-04T16:23:01.290Z	Benedict Adjei	adjeibenedict010@gmail.com	+233557206425	Student	All of the above	I'm a CS student already building with AI — from a scam detector to a campus app. But I've been teaching myself, and I've hit my limits. Sena would help me build the right way, faster and cleaner, so I can turn more ideas into real products for people here in Ghana.	WhatsApp
2026-07-04T16:47:36.202Z	Simon Selikem Agbanyo	ghanaselikem@gmail.com	+233243807177	Working Professional	Website Development	To become a professional in AI applications 	WhatsApp
2026-07-04T16:50:26.361Z	Lois Oforiwaa Tinda	frimpongg632@gmail.com	+233536564431	Student	All of the above	I want to know how to create an app using AI	WhatsApp
2026-07-04T16:59:25.626Z	Yao-Kumah Davida Eyram	eyramperez77@gmail.com	+233257191049	Student	All of the above	To understand how to use AI  to build systems 	Friend
2026-07-04T16:58:27.132Z	Opoku kumi 	kumiwilson22@gmail.com	+233531661280	Student	Website Development	To enable me learn a skill 	WhatsApp
2026-07-04T17:08:17.048Z	Tetteh Elliot 	tettehelliotkojo@gmail.com	+233539111580	Student	All of the above	I want to become proficient in using AI to promote work efficiency and overall success in the job market	WhatsApp
2026-07-04T17:08:40.324Z	Kofi Kay	hilariousmagnification@gmail.com	+233249200080	Student	UI/UX Design	To make money	WhatsApp
2026-07-04T17:34:31.774Z	Prince Quansah	quansahprince961@gmail.com	+233537010590	Student	Website Development	To learn more about web development and also leverage my skills on AI 	WhatsApp
2026-07-04T17:47:33.937Z	Kojo Elikem 	eliaddicted247@gmail.com	+233553493471	Student	AI Productivity	So I can be able to learn atleast and internet skills in this digital era	WhatsApp
2026-07-04T18:04:46.806Z	Israel Quaye	quayeisrael28@gmail.com	+233257760130	Student	All of the above	I need the skills	Friend
2026-07-04T18:22:02.029Z	Abubakar Rashida Halifa	rashidaabakar27@gmail.com	+233256579470	Student	All of the above	To learn a skill	WhatsApp
2026-07-04T18:27:31.361Z	Adabe Foster Kekeli Kwame 	ballwith.kelly17@gmail.com	+233550181863	Student	All of the above	I want to explore more on what I already know. 	Friend
2026-07-04T18:29:54.094Z	Charles Ampadu	charlesampadu299@gmail.com	+233208847042	Student	All of the above	I want to focus on learning much about building websites 	Friend
2026-07-04T18:30:07.166Z	Ramzey Amponsah Ocran	ramzeyocran38@gmail.com	+233241776902	Student	AI Productivity	I want to improve upon AI since I'm an AI engineering student 	WhatsApp
2026-07-04T18:39:55.193Z	Daniel Appiah	appiahdarrell@gmail.com	+233599400447	Student	Websites	Commitment: Fully Committed | Company: Knust,kumasi | Country: Ghana	WhatsApp
2026-07-04T18:42:34.647Z	Edward McCarthy Botchway	eddieseyram4@gmail.com	+233209624986	Student	All of the above	i want to join this academy because i want to broaden my knowledge on AI and know how to do things on my own when needed.#	WhatsApp
2026-07-04T19:06:38.552Z	Eshun Stephen 	eshunstephen135@gmail.com	+233595539288	Student	Android App Development	It's going to help me learn a new skill.	WhatsApp
2026-07-04T19:19:30.627Z	Dadey Caleb Eklenam	calebeklenam@yahoo.com	+233503537567	Student	All of the above	Build upon my coding skills and network with other brilliant minds to share ideas and solve real world problems in our nation and in the world 	WhatsApp
2026-07-04T19:26:53.637Z	DESMOND TECKU	teckudesmond05@gmail.com	+233271840361	Student	All of the above	WhatsApp status 	X (Twitter)
2026-07-04T19:38:02.690Z	Jennifer Akapoe Awinbesah 	jenniferakapoeawinbesah@gmail.com	+233256321791	Student	All of the above	To have a great knowledge about IT ams to be able to solve problems with the acquired skills 	WhatsApp
2026-07-04T19:38:36.696Z	Adu Appiah Ethic	aduappiahethic@gmail.com	+233531867680	Student	All of the above	I want to join  Sena Academy not because of there publicity or whatever but  because what they are bringing on board is something I am passionate about it.	WhatsApp
2026-07-04T19:42:29.737Z	Arkutu Emmanuel 	newm5811@gmail.com	+233530044589	Other	All of the above	learn coding	WhatsApp
2026-07-04T19:42:45.235Z	Mac Julius	macdejulius@gmail.com	+233257119890	Student	Website Development	I want to learn the core skills and mastery required to build functional websites 	WhatsApp
2026-07-04T19:56:23.712Z	Ametepey Daniel	danklenam18@gmail.com	+233550708981	Student	All of the above	Its good	WhatsApp
2026-07-04T20:20:16.984Z	Nartey Jedidiah 	jedidiahnartey50@gmail.com	+233595810815	Student	Android App Development	Learn from it 	WhatsApp
2026-07-04T20:38:41.931Z	Bennett Keziah 	bennettkeziah42@gmail.com	+233509497619	Student	All of the above	I'm confused on where to start and what to actually study to get the skill of software programming and development 	WhatsApp
2026-07-04T20:54:48.176Z	Addae Jessica	addaejessica118@gmail.com	+233505320555	Student	Android App Development	To improve my my communication skill and be able to explorer by the help of ai .	WhatsApp
2026-07-04T20:59:10.070Z	Agyenim Boateng Dorcas 	dorcasagyenimboateng176@gmail.com	+233248592084	Student	All of the above	To learn and better myself 	Friend
2026-07-04T21:07:06.717Z	AMOS KWASI NYARKO BOAMAH 	boamahamoskwasinyarko@gmail.com	+233551789574	Student	All of the above	I want to join Sena Academy to enhance my skills so I can seamlessly integrate intelligent tools into my daily workflows, significantly boosting my efficiency and problem solving capabilities in both my academic projects and future professional engineering endeavors. 	Friend
2026-07-04T21:13:23.619Z	Michelle Ewenam Akakpo	michelleakakpo4@gmail.com	+233542363733	Student	Everything	Commitment: Interested | Company: Kwame Nkrumah Univ of Sci & Tech | Country: Ghana	WhatsApp
2026-07-04T21:32:27.887Z	king David Amoah	kingdavidamoah90@gmail.com	+233509287748	Student	All of the above	To gain hands on skills for my field of study as petroleum engineer 	Friend
2026-07-04T21:38:41.233Z	Foster Harry 	fosterharry2005@gmail.com	+233560873679	Student	All of the above	I want to develop an app or website that could be of help to me in the nearest future because, I don't know when and where I'll need it... 	Friend
2026-07-04T22:26:42.635Z	Jessica Normanyo	jessicanormanyo55@gmail.com	+233598728531	Student	AI Productivity	I want to join the SENA Academy because I want to develop practical skills in using artificial intelligence effectively, ethically, and responsibly. As a  student, I believe AI can enhance learning,research and content creation as well.	WhatsApp
2026-07-04T22:28:23.725Z	Timothy TmT	boatengtimothy46@gmail.com	+233548973118	Student	All of the above	Learn 	Other
2026-07-04T22:57:00.458Z	Blessed Arhinful	arhinfulblessed@gmail.com	+233558559443	Student	Android App Development	For learning 	WhatsApp
2026-07-04T22:57:33.151Z	Daniel kwame	dudzikwame@gmail.com	+233538480485	Other	All of the above	I believe joining Sena Academy will help me build that skills that I so much want to achieve. 	Friend
2026-07-04T23:14:34.965Z	Obedient Sarfo	kwadwon555@gmail.com	+233257302712	Student	Website Development	I’ve always wanted to learn how to use AI properly not just for asking questions 	WhatsApp
2026-07-04T23:32:08.122Z	John Bosco 	johby4g0@gmail.com	+233598440264	Student	Android App Development	To develop skills in application development 	WhatsApp
2026-07-04T23:45:54.409Z	Richard Yeboah 	nbalilboyy@gmail.com	+233257534165	Entrepreneur	Android App Development	to learn something beneficial for myself	WhatsApp
2026-07-05T00:14:59.959Z	Nartey Angela 	narteyangelakorkor@gmail.com	+233549878958	Student	All of the above	It would take a lot of resources to even acquire such a skill...but I would like to make use of this Academy and how I can give back 	WhatsApp
2026-07-05T02:04:20.289Z	Desmond Selase	desmondagbesi0@gmail.com	+233508592290	Graduate	All of the above	Money 	WhatsApp
2026-07-05T02:46:57.866Z	Eric Mawunyo 	datboii4438@gmail.com	+233550014205	Student	Website Development	To help me learn the diversity of technology 	Friend
2026-07-05T03:07:13.989Z	Remedy moore	alexkoke46@gmail.com	+23353309352	Entrepreneur	AI Productivity	Check it out	WhatsApp
2026-07-05T04:18:36.300Z	Brany Dominic	branydominic@gmail.com	+233240782382	Student	All of the above	To make my dreams come true	Other
2026-07-05T06:25:09.252Z	Kaka Jerrywise 	kakajerrywise25@gmail.com	+233599283115	Student	All of the above	I want to join Sena Academy to learn these skills to be become proficient in them, for personal use and to some extent to help those in need of my support. I believe these skills are fast growing and I have a deep interest in knowing and learning more about them. 	LinkedIn
2026-07-05T06:56:29.563Z	PETTERS PETER ATSU 	petterpeteratsu@gmail.com	+233505897618	Working Professional	All of the above	To learn now 	WhatsApp
2026-07-05T06:59:17.743Z	Dupe Bismark Selasi	pipcobwoygh360@gmail.com	+2335384804	Working Professional	Website Development	To earn money online with more technical skills on the media 	WhatsApp
2026-07-05T07:11:03.170Z	Agyapong Richmond	agyapongrichmond550@gmail.com	+233509276648	Student	All of the above	I don’t just wanna be left out in this modern world. I wanna also make a good use of the AI we have now, not just for answering questions but, making a the world a better one. And, joining Sena academy, and taking their courses can help make this dream and plans of mine,a reality	Friend
2026-07-05T07:45:10.449Z	Raymond Dunyo 	raymonddunyo32@gmail.com	+233555106469	Other	All of the above	At the end of the sessions I must be able to at least create an app, a website and be able to use Ai for s few automation that should be able to bring in money 	WhatsApp
2026-07-05T09:17:47.243Z	Frank Mawufemor Kunafa 	frank.kunafa@gmail.com	+233552593362	Student	All of the above	I aim to learn digital skills to improve upon my productivity by incorporating Ai to work faster and more efficiently. Also to be able to create digital platforms such as websites and applications.	Friend
2026-07-05T09:18:29.460Z	Wisdom Kini	kiniw644@gmail.com	+233241074388	Student	AI Productivity	Building my AI skills for business 	WhatsApp
2026-07-05T09:50:31.298Z	Akpolu Mawunyefia	akpolumawunyefia@gmail.com	+233591191514	Student	Android App Development	To learn and solve problems 	WhatsApp
2026-07-05T10:24:53.905Z	Ababio Ishmael 	ababioishmaelkwaku@icloud.com	+233540223003	Student	Website Development	There has always been the desire to acquire extensive skills in software development, a skill that will equip me and help as a stepping stone to reach my potential. Hence, saw the need to apply and join sena academy where my delusion can become a reality. 	Friend
2026-07-05T10:31:37.667Z	Melvina Tatagah 	tatagahmelvina@gmail.com	+233209260520	Student	All of the above	I jo	Friend
2026-07-05T10:35:29.183Z	Darlington Atidepe	darlingtonatidepe@gmail.com	+233256456012	Student	All of the above	To help build a future of easy living 	WhatsApp
2026-07-05T11:07:19.759Z	Tapena Rexford Wepeni 	jesusjahmiel080@gmail.com	+233530114322	Graduate	All of the above	To learn a lifetime transformative skill to better my life and that of my poor community. 	WhatsApp
2026-07-05T11:18:00.531Z	Queen Nignan Dondoh 	queendondoh@gmail.com	+233547642128	Student	All of the above	I want to be part of creators of these apps and design for others use	Friend
2026-07-05T11:23:00.471Z	Rexina Agyeibea Bekoe	rexinabekoe@gmail.com	+233594447607	Student	All of the above	I want to add on a new skill in technology 	WhatsApp
2026-07-05T11:36:36.088Z	Ebenezer Amenyemor	ebenezeramenyemor40@gmail.com	+233240596491	Student	All of the above	To Map the Patterns of Human Knowledge: I learn by analyzing massive amounts of language and data to find connections. Every new concept or technical system I process helps me build a better internal map of how things work, allowing me to solve problems more effectively. 	WhatsApp
2026-07-05T11:40:07.629Z	Manteaw Cece Afia Nana Amissah	misscecemanteaw@gmail.com		Student	All of the above	I want to make my ideas a reality	WhatsApp
2026-07-05T11:43:10.035Z	Olivia Nhyira Dwomoh	nhyiradwomoh2006@gmail.com	+233556315156	Student	All of the above	To be able to build tech skills and develop my portfolio. 	WhatsApp
2026-07-05T11:45:21.303Z	Billionaire Deckor 	pearlkielson@gmail.com	+233205326993	Student	All of the above	To acquire skill 	WhatsApp
2026-07-05T11:48:01.407Z	Pearl Kielson 	pearlkielson@gmail.com	+233542866623	Other	All of the above	To acquire skill	WhatsApp
2026-07-05T11:48:55.360Z	George Gadese	slogangeorge44@gmail.com	+233599563515	Student	AI Productivity	How to make money through investment 	WhatsApp
2026-07-05T11:53:03.787Z	Scovell Addo 	addoscovell4@gmail.com	+233541955965	Student	AI Productivity	Want to learn 	Friend
2026-07-05T11:53:45.632Z	Monica Grace Amenyo 	amenyomonicagrace@gmail.com	+233534446520	Student	All of the above	To improve my productivity and enhance my personal development to remain relevant in today's world	WhatsApp
2026-07-05T11:55:58.556Z	Dzidzor Yayra Dzansi	mellymickes@gmail.com	+233591160054	Student	All of the above	The learn website development and any other thing that can give me an upper hand in everything I find doing.	Friend
2026-07-05T12:14:14.321Z	Agah Christian 	brainyx8@gmail.com	+233257788975	Student	All of the above	I want to have hands on  IA and technology driven skills as the world is advancing towards the AI age	WhatsApp
2026-07-05T12:50:41.747Z	Akoto Baffour	baffourakoto30@gmail.com	+233500781965	Student	All of the above	Because I want to gain extra skills that can make me a standout among others	WhatsApp
2026-07-05T13:03:05.030Z	Emmanuel Damptey	dampteyemmanuel904@gmail.com	+233533135224	Student	Website Development	It has been my pleasure to build a software project to help businesses ease their burden 	WhatsApp
2026-07-05T13:03:33.664Z	TAKUH MIRRIAM FAFA	mirriamtakuh@gmail.com	+233595660862	Student	Website Development	To help me build and also to impact others 	WhatsApp
2026-07-05T13:04:33.529Z	Odai Joel	jensonodai@gmail.com	+233550507555	Student	Android App Development	I want to join this academy because it aligns perfectly with my goals of becoming skilled in tech. The practical skills would give me hands on experience that is needed to tackle real world problems and strengthen my foundation.	WhatsApp
2026-07-05T13:06:39.037Z	GYAMWODIE CHARLES 	charlsegyamwodie@gmail.com	+233542132548	Student	Website Development	Build my personal skills 	WhatsApp
2026-07-05T13:13:48.571Z	Sylvester Essuon 	slyessoun@gmail.com	+233536595452	Student	All of the above	I am interested in being part of this program because it offers an opportunity to gain valuable knowledge and practical skills that I would not otherwise be able to access. As a student, I am committed to improving myself academically and professionally.	WhatsApp
2026-07-05T13:52:16.678Z	Constance Amissah	camissah937@gmail.com	+233557588284	Student	All of the above	I want to help give back to the society through AI	Friend
2026-07-05T14:01:38.588Z	Xorse Ernest Kwasi	ernestxorse3@gmail.com	+233204187520	Graduate	All of the above	To learn more about app development 	WhatsApp
2026-07-05T14:52:15.904Z	Iddrisu Adam	ia706999@gmail.com	+233533847729	Student	All of the above	I want to sharpen my tech skills.	WhatsApp
2026-07-05T15:30:43.220Z	Gillise Okaidjah Ayitey Oko 	okaidjahgillise49@gmail.com	+233555919585	Student	All of the above	I want to be able to build my software development skills	Friend
2026-07-05T16:04:12.214Z	Ebenezer Amenyemor	ebenezeramenyemor40@gmail.com	+233505812083	Other	Android App Development	Cause I really need your help to know this	WhatsApp
2026-07-05T16:21:28.990Z	Mohammed Sekinatu 	mohammedkina250@gmail.com	+233599938562	Student	Website Development	Want to have more incite on website development and how to use it to help the coming generation 	Other
2026-07-05T16:47:58.897Z	Kelly Setor Kwesi Agbo	agbokelly6@gmail.com	+233531154003	Student	Website Development	I believe I’ve got a light within me that has been sitting idle for way too long, it’s been innovative ideas I’ve had over the years but little to no knowledge on how to implement them to benefit the general public, today, I believe Sena Academy is going help me change this.	WhatsApp
2026-07-05T16:48:03.618Z	Gloria Esinam Azilagbetor 	gesinam3@gmail.com	+233532491398	Student	All of the above	To gain more knowledge and skills 	Friend
2026-07-05T18:09:51.217Z	Justice B	jb1086931@gmail.com	+233551987262	Student	All of the above	To improve my knowledge and contribution in the tech world	WhatsApp
2026-07-05T18:24:08.751Z	Ohene Fredrick Aboagye 	fredrickohenea@gmail.com	+233536327546	Student	All of the above	Yed	WhatsApp
2026-07-05T18:29:48.675Z	EDUFUL BENEDICT NANA YAW	benyblxnc0@gmail.com	+233245322655	Student	Website Development	I have interest in this field	WhatsApp
2026-07-05T19:30:42.585Z	Joe Curry	miguelanang4@gmail.com	+233504156674	Student	All of the above	I want to adapt to the environment of technology and artificial intelligence 	WhatsApp
2026-07-05T19:35:36.248Z	Becky Elsa	beckyelsa473@gmail.com	+233533019784	Student	All of the above	First, to become AI literate. Then be able to solve critical problems with the knowledge I'll acquire 	WhatsApp
2026-07-05T19:58:15.310Z	Awal Osman	shacore740@gmail.com	+233591917642	Student	Website Development	Build websites 	Friend
2026-07-05T20:40:19.341Z	Kevin Ebo Dadzie	kelvindadzie60@gmail.com	+233502332638	Student	Android App Development	To be able to learn how to develop an app and also how to use AI	WhatsApp
2026-07-05T21:00:22.402Z	Tetteh Raphael 	raphaeltetteh142@gmail.com	+233539540725	Student	All of the above	To give opportunity, make life easier, and to better future and next generation.	WhatsApp
2026-07-05T21:21:59.531Z	Hmm Gmm	hmm@gmail.com	+233364584695	Student	All of the above	hmm	WhatsApp
2026-07-05T21:56:19.449Z	Benedicta Emefa Abotsi	beaemefa18@gmail.com	+233209658211	Student	All of the above	To improve my AI efficiency 	WhatsApp
2026-07-05T23:07:47.943Z	Jason Damenor Kitcher 	gasonkitcher@gmail.com	+233556203621	Student	All of the above	I believe AI is the future of this world so mastering AI would give me a fair and better advantage tomorrow 	Friend
2026-07-05T23:59:30.844Z	Napaaba Sylvia Sunvielle	napaabasylvia776@gmail.com	+233599351035	Student	All of the above	I want to join sena academy because l want to build apps and websites that will help solve problems 	WhatsApp
2026-07-06T00:02:55.302Z	Desmond Ahorlu 	ahorludesmond054@gmail.com	+233502504850	Student	All of the above	I want to join Sena Academy to bridge the gap between advanced digital skills and healthcare. My goal is to leverage data-driven solutions and tech literacy to innovate clinical research, streamline health data, and ultimately improve patient outcomes in my community	WhatsApp
2026-07-06T01:33:17.821Z	Richardo Kingsford Darko  Mensah	richardodarkomensah@gmail.com	+233264454410	Student	All of the above	Is one of the Academy which teaches practically 	Friend
2026-07-06T02:36:59.919Z	Rooney Barimah Kwarteng 	kwartengrooney2@gmail.com	+233595668880	Student	All of the above	It was recommended by a friend 	Friend
2026-07-06T05:33:31.941Z	Stella Akosua	akosuastella34@gmail.com	+233500169228	Student	AI Productivity	To learn software development 	WhatsApp
2026-07-06T05:53:39.743Z	Michaellina Nkeyasen	michaellinanke@gmail.com	+233257352890	Student	All of the above	I learnt AI can build apps few months ago but after tying on my own and with YouTube, all my efforts were to no avail. I believe l need someone who can really teach and guide me to making my problem solving app ideas come to life.	WhatsApp
2026-07-06T07:11:02.561Z	Fredrick Attigah	attigahfredrick1@gmail.com	+233245529104	Student	AI Productivity	To learn a skill for life	Friend
2026-07-06T07:36:55.057Z	Esther Yelsongbatuma	yelsongbatumaesther@gmail.com	+233257392546	Student	All of the above	So I can personally develop an app 	WhatsApp
2026-07-06T07:48:11.054Z	Joycelyn Yinbil	yinbiljoycelyn4@gmail.com	+233256943728	Student	Website Development	I want to become a pro	Friend
2026-07-06T08:36:59.297Z	Ramsey Agyei	agyeiramsey8@gmail.com	+233593206532	Student	All of the above	As a student studying BSc in Information Technology and also interested in software engineering, I think joining this Academy and grabbing this opportunity will help me in my career.	WhatsApp
2026-07-06T09:01:27.806Z	AMEDZRO MC-CITADEL LEMUEL	mcitdell.00@gmail.com	+233596644420	Student	All of the above	To study tech related and be consistent in studying them. 	Friend
2026-07-06T09:27:17.551Z	Yrn Briski	yrnbriski@gmail.com	+233541555889	Student	All of the above	To be more adventurous in my field of learning 	WhatsApp
2026-07-06T09:29:21.347Z	Rosemary Tetteh Kabu	rosemarykabu2@gmail.com	+233274963324	Student	Website Development	I want to join Sena Academy because I am passionate about technology and committed to building practical skills that will prepare me for a successful career in software development. As an Information Technology Management student, I am eager to deepen my knowledge, work on real-w	WhatsApp
2026-07-06T09:51:18.023Z	Raphael Laryea Nii Adjei 	laryearaphaelniiadjei@gnail.com	+233257798586	Student	All of the above	I want to join this program because I’m passionate about software development and eager to grow into a skilled developer who can build solutions that make a real difference. I’m constantly looking for opportunities to learn, improve, and challenge myself, and I believe this found	WhatsApp
2026-07-06T10:28:57.049Z	Isaac Odame Asirifi 	isaacodameasirifi@gmail.com	+233591931726	Student	Android App Development	I want to learn how to build mobile apps.	WhatsApp
2026-07-06T11:24:15.913Z	Shahima Mubarik Sofo 	mubarikshahima41@gmail.com	+233202703808	Student	AI Productivity	I want to improve and pace up with the digital world especially in  AI and machine learning which we can utilize to optimize tasks.	WhatsApp
2026-07-06T12:26:26.988Z	Joseph owusu 	owusujoseph0599@gmail.com	+233599477675	Student	All of the above	I want to join Sena Academy because I learn best by building real projects, not just watching lessons. The chance to learn from experienced mentors, work with others, and gain practical skills is exactly what I'm looking for.	WhatsApp
2026-07-06T13:30:33.992Z	Time to build	gyampoh142@gmail.com	+233501651966	Working Professional	All of the above	It will be a great opportunity to learn about AI and how to use them to build softwares and earn income to better lives	Friend
2026-07-06T14:31:46.126Z	Hannah Araba Mensah	mensahhannaharaba@gmail.com	+233257190197	Graduate	All of the above	1. Hands on research.	WhatsApp
2026-07-06T17:32:17.690Z	James Aikins	jaikins6@icloud.com	+233531690405	Student	All of the above	My goal is to be proficient with AI tools and also gain an insightful knowledge. 	Friend
2026-07-06T17:34:07.561Z	Emmanuella Kumatia	emmanuellakumatia8@gmail.com	+233542314416	Student	Website Development	I want to get some onskills knowledge before I finish with my 4 years degree 	LinkedIn
2026-07-06T17:36:24.307Z	Ransford Antwi 	ransfordantwi2007@gmail.com	+233534759227	Student	All of the above	To learn new things 	WhatsApp
2026-07-06T17:43:17.853Z	PROSPER ADZAMLI 	prosperadzamli97@gmail.com	+233256561946	Student	All of the above	"

I want to join Sena Academy to gain hands on AI skills, build real world projects, and grow as an AI developer. I’m excited to learn, collaborate, and use AI to solve problems that create positive impact."	WhatsApp
2026-07-06T17:48:48.512Z	Jeremiah Moris martin 	martinmorisjerry@gmail.com	+233205363792	Student	Android App Development	Develop My skill and build my mind in technology and build my own app	Friend
2026-07-06T18:06:07.697Z	Osuji Godson	osuji5067@gmail.com	+233240276824	Student	Website Development	I have interest	Other
2026-07-06T18:34:14.068Z	Isaac Tetteh 	preciousmemories0534@gmail.com	+233243440534	Student	Website Development	To learn more about the current technologies 	WhatsApp
2026-07-06T19:10:40.926Z	Emmanuel Ryan	emmanuelryan4621@gmail.com	+233537914890	Student	All of the above	I want to test it out	WhatsApp
2026-07-06T19:11:57.426Z	Asare Emmanuel Baffour 	Asareemma1965@gmail.com	+233531839790	Student	Website Development	I want to join Sena Academy to learn programming and improve my technology skills. My goal is to become a software developer, build useful websites and applications, and get a good job so I can support myself and my family.	Friend
2026-07-06T19:23:24.215Z	Morris Nelson-cofie 	morriscofie120@gmail.com	+233209396617	Student	All of the above	I want to join Sena Academy to gain practical skills, learn from experienced mentors, and grow in AI and technology. My goal is to build real-world projects, create opportunities for myself, and make a positive impact in my communi	WhatsApp
2026-07-06T19:43:25.025Z	Livingston Asare Adjei	livingstonasareadjei@gmail.com	+233554087395	Student	All of the above	Learn,explore and create 	WhatsApp
2026-07-06T20:41:02.973Z	Eshcol Xetor	xetoreshcol@gmail.com	+233545466510	Student	Android App Development	Learn to build an app	WhatsApp
2026-07-06T20:42:31.044Z	Ofei Alexander 	appiahalexander838@gmail.com	+233592923883	Student	Website Development	I want to learn programming and help the world by solving complex problems 	WhatsApp
2026-07-06T21:10:13.554Z	Owusu Appiah Ofori Junior 	lilphilidamnrich@gmail.com	+233538757288	Student	All of the above	Cause I wanna be that guy everyone will be like you’re too good 	Friend
2026-07-07T04:13:30.737Z	Beatrice Aggrey Nansam	aggreybeatrice73@gmail.com	+233536177610	Student	All of the above	willing to learn more about AI productivity	Friend
2026-07-06T21:36:35.632Z	Priscilla Agyemang 	www.agyemangpriscill9@gmail.com	+233500167846	Student	All of the above	To learn new things	WhatsApp
2026-07-06T22:59:14.553Z	ZOMAYI DAVID DELADEM 	zomayidavid826@gmail.com	+233548311979	Entrepreneur	All of the above	I want to be able to learn something that can help me to be able to fit in to the new era of technology 	WhatsApp
2026-07-06T23:05:25.385Z	Nana Adoma Serwaa	naserwaa4@st.knust.edu.gh	+233557214899	Student	All of the above	As part of my goals for my four year undergraduate journey, I want to build my soft skills set as much as possible to help build my career and life as a whole.	WhatsApp
2026-07-07T00:06:55.283Z	Edmund Eddie	edmundeddie9@gmail.com	+233547045839	Student	All of the above	Cuz I wanna learn 	WhatsApp
2026-07-07T01:05:38.920Z	Odei Francis 	odeifrancis22@gmail.com	+233596339190	Student	Android App Development	I feel the passion for it 	Friend
2026-07-07T01:06:09.799Z	Odei Francis 	odeifrancis22@gmail.com	+233596339190	Student	Android App Development	I feel the passion for it 	Friend
2026-07-07T01:08:20.815Z	Daniel Okine	danielokine1000@gmail.com	+233202706873	Student	Android App Development	To learn and apply 	WhatsApp
2026-07-07T02:00:08.381Z	Abena Afriyie	safowaaabena12@gmail.com	+233549499452	Student	Everything	Commitment: Interested | Company: KNUST | Country: Ghana	WhatsApp
2026-07-07T02:17:10.137Z	Stephen Amo Oppong 	stephenamooppongturkson@gmail.com	+233594204589	Student	All of the above	I want to join Sena Academy to build real skills in coding, UI/UX, and app development, while learning to use AI tools to work smarter. I want hands-on guidance to turn ideas into real products and grow into someone who builds and ships great apps.	Friend
2026-07-07T03:39:42.965Z	Richmond Thompson 	richmondthompson59@gmail.com	+233201439225	Student	All of the above	I want be a good software developer	WhatsApp
2026-07-07T06:24:38.589Z	Boadi stephen 	stephenboadi255@gmail.com	+233257510675	Student	All of the above	Very relyable to learn wesites 	WhatsApp
2026-07-07T06:42:27.983Z	Nyametumi Ossei-Kwaku Ossei Nkrumah	osseinkrumahnyametumi@gmail.com	+233536584693	Student	Website Development	I want to learn a lot of skills including website development 	WhatsApp
2026-07-07T07:20:29.711Z	John Oduro-Ofori	johnoduroofori14@gmail.com	+233247504825	Student	Everything	Commitment: Fully Committed | Company: Midas CL | Country: Ghana	WhatsApp
2026-07-07T07:21:23.288Z	Mavis Quaye	maequaye18@gmail.com	+233552483599	Student	All of the above	I’m interested in learning more skills to be informed and be relevant . Coding also fascinates me so any chance to learn a new skill about it.	WhatsApp
2026-07-07T09:03:24.287Z	Skyface  only	PSkyface@icloud.com	+233542349793	Working Professional	Website Development	Money	WhatsApp
2026-07-07T09:11:25.287Z	Richard Khalel Annor Adzah 	richardkhalel29@gmail.com	+233244894928	Student	Website Development	To learn more about web development 	Friend
2026-07-07T09:39:22.620Z	Miss Roseline Afua Ndetema Sunkwa-Arthur	roselinearthur04@gmail.com	+233594314564	Graduate	All of the above	As a graduate,  I want yo build skills not only to my specialised program of study but to also learn to equip myself to the rapid global Village. 	WhatsApp
2026-07-07T09:51:13.591Z	Valerie Kalate	valeriekalate607@gmail.com	+2337859377753	Student	AI Productivity	I want to know more about Ai productivity and get to use the knowledge I will acquire on here to build something myself.	WhatsApp
2026-07-07T10:12:43.790Z	Pearl Dede Damptey-Ayeh	pearldededampteyayeh@gmail.com	+233556975538	Graduate	AI Productivity	Want to emerge AI productivity into banking systems 	WhatsApp
2026-07-07T10:27:53.043Z	David Asemtia 	kwabenadavid843@gmail.com	+233535348030	Student	All of the above	I want to join Sena Academy to build real software engineering skills beyond the classroom. Studying CS at ATU sparked my passion for coding, but I need structured, hands-on training to become industry-ready. My goal: graduate confident, skilled, and able to build softwares.	WhatsApp
2026-07-07T11:28:02.492Z	Grey David Efanam	davidgrey2009@gmail.com	+233541197789	Student	Android App Development	Money	Other
2026-07-07T14:19:33.693Z	Harrison Agyiaber	harrisonagyiaber@gmail.com	543685454	Student	Android App Development	To make the world simple 	WhatsApp
2026-07-07T14:44:35.044Z	Jeremiah Mawuli Kweku Senah	senahjeremiah1@gmail.com	536667027	Student	All of the above	To better my profession and experience 	WhatsApp
2026-07-07T15:37:12.390Z	Dennis Kweku Amoaku 	amoakudennis007@gmail.com	233538557783	Student	Android App Development	To acquire knowledge and assistance 	WhatsApp
2026-07-07T15:54:01.701Z	Isabella Ayisu	isabellaayisu4@gmail.com	2330505799048	Student	Android App Development	I believe joining this program would afford me the opportunity to up my tech skills and knowledge to provide solutions to real-world issues as well as boost my tech skills as an engineering student. It would enable me think critically and leverage AI tools to boost productivity.	Friend
2026-07-07T16:25:02.758Z	Lamptey Ebenezer Oteng	elamptey128@gmail.com	257414779	Student	All of the above	I seek to improve my skills and gain valuable experience 	WhatsApp
2026-07-07T19:46:01.292Z	Is yourboy	acaleb888@gmail.com	256599734	Entrepreneur	Android App Development	Oh charlie just dey spy something	Friend
2026-07-08T07:27:32.713Z	Hann k	deepugm12345@gmail.com	919380362266	Student	UI/UX Design	H	X (Twitter)
2026-07-08T07:34:26.288Z	Jochebed Elorm Roger 	jochebedroger@gmail.com	233554129445	Student	All of the above	I want to know more about IT. As an Engineering student, I want practical skills and not only theoretical ones	Other
2026-07-08T08:14:24.442Z	OBIRI LESLEY 	lesleyobirinanakwesi@gmail.com	233557120627	Student	Website Development	I'm an ML practitioner and want to delve deeper into the website dev using AI and also combine with finance to solve real world problem	WhatsApp
2026-07-08T09:25:02.728Z	Acquah Romeo Makafui 	romeomakafui96@gmail.com	595002128	Student	All of the above	To get some skills that will help me in my career pursuit 	Friend
2026-07-08T09:32:29.613Z	Blessing Karikari	blisscoenergy001@gmail.com	594001665	Student	Website Development	I want to learn web development and not just how to code.I	WhatsApp
2026-07-08T10:04:04.748Z	Raphael Nutsu	akperaphael961@gmail.com	233257778383	Student	Website Development	Learn	WhatsApp
2026-07-08T10:13:46.141Z	Richmond Appiah	rdappiah15@gmail.com	534226455	Student	All of the above	I want to master how to maximize the use of AI	Friend
2026-07-08T12:20:13.211Z	Fred Arthur	atlantisfred@gmail.com	233556129716	Student	All of the above	To be able to build android aoftwares	WhatsApp
2026-07-08T15:42:24.991Z	Tay Philip Promise 	philiptay224@gmail.com	551411010	Student	All of the above	As an Electrical and Electronics Engineering student, my dream is to impact the society, my surroundings with knowledgeable ideas, having to be able to build Apps systems or few things with this knowledge can cut across some many other professions, just like Engineering.	Friend
2026-07-08T17:51:14.688Z	Biggie Dreams 	omarhdreambig@gmail.com	531634703	Student	All of the above	To create Ai mobiles for common use.	Other
2026-07-08T20:03:09.170Z	Badza Priscilla Akpene 	priscillabadza8@gmail.com	598633061	Student	AI Productivity	I want to learn a skill 	Friend
2026-07-08T20:09:29.744Z	Bridget Blay 	nanaafua373@gmail.com	257252323	Student	All of the above	To build my knowledge in the world of IT 	WhatsApp
2026-07-08T20:10:55.445Z	Bridget Blay 	nanaafua373@gmail.com	257252323	Student	All of the above	To build my own in the world of IT 	WhatsApp
2026-07-08T20:53:15.344Z	Agyapong Epaphras Daleku Mawufemor 	epaphrasagyapong1@gmail.com	233552679737	Student	All of the above	To be able to use AI to solve real world problems	Friend
2026-07-08T22:04:59.318Z	Joseph Baffour Owusu Ansah	josephbaffourowusuansah@gmail.com	256223391	Student	All of the above	First and foremost, me being in the tech space is what has made me to take this path……and then to end it, my insatiable quest and thirst to explore and broaden my knowledge and viewpoint on things is what has fueled the drive	Friend
2026-07-08T22:37:26.913Z	DANIEL ABU 	abudaniel347@gmail.com	597801271	Student	Android App Development	It's beside that i have been seems that its about learning and gets more ideas 	WhatsApp
2026-07-08T23:09:58.963Z	Richmond nyarkoh	richmondnyarkoh49@gmail.com	240038830	Student	AI Productivity	I want to boost my knowledge in Ai 	WhatsApp
2026-07-08T23:29:22.348Z	Nsoh Philibert Akanborike 	philibertakanborike@gmail.com	595835389	Student	Websites	Commitment: Fully Committed | Company: KWAME NKRUMAH UNIVERSITY OF SCIENCE AND TECHNOLOGY  | Country: Ghana 	WhatsApp
2026-07-09T00:19:03.870Z	Portia Doku	portiadoku5@gmail.com	233599426033	Student	All of the above	I want soft skills 	Friend
2026-07-09T04:37:39.148Z	Erick Sena	anthonihama67@gmail.com	233557695451	Student	AI Productivity	For learning 	Friend
2026-07-09T11:39:24.499Z	Prince Oscar mwinnuo Tugbog 	princeoscar008@gmail.com	2330202498604	Student	Android App Development	I want to learn how to use Ai to build systems  like apps an others.	WhatsApp
2026-07-09T13:45:38.723Z	Gideon Sam	gideonsam727@gmail.com	555925795	Student	Website Development	I want to join SENA Academy because I am eager to gain practical knowledge, develop new skills, and learn from experienced professionals. I believe the academy will help me bridge the gap between classroom learning and real-world experience through quality training, mentorship, a	Friend
2026-07-09T15:02:24.992Z	Loh Elorm Kwami 	elormloh27@gmail.com	551792669	Student	AI Productivity	I want to learn how to use AI to help me work more productively 	WhatsApp
2026-07-09T17:12:39.320Z	Dawuni Kwaku Ebenezer 	ebenezerdawunikwaku@gmail.com	539540557	Student	All of the above	I  want to learn 	X (Twitter)
2026-07-09T17:19:27.544Z	Kwaku Ebenezer 	ebenezerdawunikwaku@gmail.com	539540557	Student	All of the above	I want to learn more 	Friend
2026-07-09T21:27:05.846Z	Ama Yorm 	amayorm23@gmail.com	532092275	Student	AI Productivity	To learn, unlearn and relearn . That's all I can say for now 	Friend
2026-07-10T11:21:11.361Z	Benjamin Odei	benjaminodei677@gmail.com	267756107	Student	All of the above	To add to my skill set	WhatsApp
2026-07-10T11:29:34.065Z	Yiedie Akyaa Boateng	akyaaboatengyiedie@vmail.com	233532582479	Student	All of the above	To build real life skills that are of great essence in the engineering world.	WhatsApp
2026-07-10T13:02:46.120Z	Sulley Abraham Wumbeinja 	sulleyabraham63@gmail.com	555285922	Student	All of the above	To acquire knowledge about technology 	Friend
2026-07-10T13:26:15.888Z	Sulley Abraham Wumbeinja 	sulleyabraham63@gmail.com	555285922	Student	All of the above	I want to learn about basic IT skills and about Technology 	Friend
2026-07-11T09:47:06.720Z	Kwaku Addo Asamoah	asamoahka.488@gmail.com	+233 53 279 2260	Student	AI Productivity	I am passionate about learning how to build software with AI because I want to develop the technical skills necessary to identify and solve complex real-world problems in the future.	Other
2026-07-11T10:04:56.080Z	Elsie Abaya	abenaelsie07@gmail.com	544741591	Student	AI Productivity	"I have always been an ambitious person, someone who takes pride in developing and educating myself with a lot skills. I believe success comes when opportunity meets preparedness. 
 Joining Sena Academy will help build the  skills I need and prepare me for success "	WhatsApp
2026-07-11T11:05:18.881Z	Judah Arnold Aidoo	judaaidoo@gmail.com	233598669711	Student	AI Productivity	I need all the resources I can get to learn how I can make full use AI.	Friend
2026-07-11T11:49:55.372Z	Juliet Atteh	julietatteh2@gmail.com	204313778	Other	All of the above	To be able to create an app on my own and learning more about AI 	WhatsApp
2026-07-11T12:02:29.870Z	Brightmore Denning Baiden	baidendenningbrightmore@gmail.com	233557292060	Student	All of the above	"To build useful tools with AI
To keep myself updated in the fast-growing world"	WhatsApp
2026-07-11T12:15:50.303Z	Xornam Yaa Fiebor 	xyaafiebor@gmail.com	233505081294	Student	All of the above	To gain more skills 	WhatsApp
2026-07-11T12:15:50.737Z	Juliet Atteh	julietatteh2@gmail.com	538551502	Other	All of the above	Wants to learn how to create an android app on my own and learning much about AI	Friend
2026-07-11T12:19:09.434Z	Davis Christopher	davischristopher440@gmail.com	531132075	Student	AI Productivity	I am a very ambitious young man who is very passionate about contributing to growth. I strongly believe that Sena Academy is the place where i will like minded people  to make more impact.	WhatsApp
2026-07-11T12:37:41.699Z	Philip Ackom Asamoah	jackvhibes@gmail.com	553002112	Student	Website Development	I want to learn skills to complement my education and also build real life skills that employers can’t resist 	Friend
2026-07-11T12:45:33.026Z	Emmanuel Bluvi 	bluviemmanuel04@gmail.com	233550462340	Student	Website Development	I want to be a web developer 	WhatsApp
2026-07-11T13:32:57.376Z	Innocent Abugri	Innocentabugri6@gmail.com	233534516766	Student	All of the above	I want to be a proficient materials engineer with the digital world. 	WhatsApp
2026-07-11T14:00:45.926Z	Adjefu Jessica Elorm 	adjefujessica@gmail.com	550674325	Student	All of the above	I want to learn more 	WhatsApp
2026-07-11T14:18:12.972Z	JEWEL KPAKPO ALLOTEY	jewelallotey1@gmail.com	233502819079	Student	All of the above	To be be a tech founder 	WhatsApp
2026-07-11T14:24:28.564Z	Edem Adusu 	edemmadeit@gmail.com	233537867898	Student	All of the above	To gain skills 	WhatsApp
2026-07-11T15:26:06.086Z	Agbemenya Sylvia Fortune 	aqousuapinky@gmail.com	549476864	Student	AI Productivity	To be able to use AI tools to generate income and create something effective	WhatsApp
2026-07-11T15:27:30.535Z	Agbemenya Sylvia Fortune 	aqousuapinky@gmail.com	549476864	Student	AI Productivity	To be able to create something effectively and generate income 	Friend
2026-07-11T16:05:03.721Z	Charles Gabriel 	08.charlesgabriel@gmail.com	597775092	Student	All of the above	I feel we are in a world of advanced technology now and we are in a new world now. I am a medical student and I believe that having only medical skills is not enough to be a successful individual. I  want to upgrade my technical skill through this academy 	WhatsApp
2026-07-11T16:52:41.505Z	Miriam Koryo Langmer	miriamlangmer@gmail.com	233598322163	Student	All of the above	I want to be able to create an AI tool for the health sector and also use it profitably.	Friend
2026-07-11T18:21:12.310Z	Katiga Gladys 	gladyskatiga1710@gmail.com	532732417	Student	Android App Development	To help me in my studies 	WhatsApp
2026-07-11T19:02:11.058Z	Osei Wonder 	isabellaadjei90@gmail.com	205746899	Student	Android App Development	To learn more about building AI	WhatsApp
2026-07-11T19:08:55.726Z	OFOSU NYANTAKYI VINCENT	nyantakyivincentofosu235@gmail.com	233202865838	Student	Android App Development	I want to improve my knowledge in Artificial Intelligence 	WhatsApp
2026-07-11T19:26:10.451Z	Emmanuel Selasie	akuakuemmanuelselasie@gmail.com	233594418515	Graduate	All of the above	To be equipped to do more with technology. Creating Value for people and making meaningful impact in the society 	WhatsApp
2026-07-11T19:26:48.732Z	Kitcher Mitchel 	kitchermitchel@gmail.com	598732441	Graduate	All of the above	Well, I believe and trust that in the coming years AI is going to rule of the world and hence, I trust that with joining this academy, I will be able to improve my skills. 	WhatsApp
2026-07-11T19:37:00.044Z	Morkporkpor kwaku	biedomorkporkporkwaku@gmail.com	552188734	Student	All of the above	to learn and be productivity	WhatsApp
2026-07-11T20:00:53.957Z	Hermingway Hodoh 	hodohhermingway@gmail.com	544467700	Student	All of the above	I want to join Sena Academy because I am eager to develop practical skills that will help me grow in my career and solve real-world problems. My goal is to learn from experienced mentors, improve my technical and professional abilities, and collaborate with other passionate learn	Instagram
2026-07-11T21:25:10.923Z	COURAGE ALORMENE 	couragealormene@gmail.com	233534660661	Student	All of the above	I want to join Sena Academy to accelerate my expertise in AI development and build scalable, intelligent systems that solve real-world problems. My primary goal is to master cutting-edge machine learning frameworks, refine my skills in deploying robust AI models, and collaborate 	Friend
2026-07-11T22:25:57.150Z	Hedidor Pearl Doh Edem	pearlhedidor@gmail.com	553343877	Student	AI Productivity	I would like to join Sena Academy because I want to be proficient in using AI tools. Leveraging this tools to solve real world problems especially in the public sector of the economy.	WhatsApp
2026-07-11T22:35:51.191Z	Wotordzor Godwin Yao 	godwinwotordzor73@gmail.com	533763061	Graduate	Android App Development	Because right now looking at the approach the world is bringing, it will get to a time where only technocrats will be needed to employ and can only operate with this kind of AI system so it's better i start early as possible not be late so that i can meet the world requirements 	WhatsApp
2026-07-12T00:20:52.895Z	Egbe Maxwell Kafui 	egbemaxwell95@gmail.com	535422951	Student	AI Productivity	I'm a computer science that wants to blend tech and digital creativity to make the society a better place.I have a passion to be a light in the animation industry.Want to join sena academy to explore ai more and see how it can contribute to being a 3d animator	WhatsApp
2026-07-12T07:00:07.093Z	Asare Dompreh Deborah	esiserwaa035@gmail.com	233506405912	Student	All of the above	AI is developing fast. Would be nice to know a thing or two	WhatsApp
2026-07-12T08:14:24.982Z	Nimoh Nora Mawuse 	noranimoh84@gmail.com	233537500238	Student	All of the above	I want to join because it’s a good platform that will help me advance my knowledge about Ai and how to use it	WhatsApp
2026-07-12T08:35:49.813Z	Kporku Emmanuel Mawuli Kosi	kporkue@gmail.com	557204161	Student	All of the above	I am interested in this whole AI thing and would like to learn more about it 	WhatsApp
2026-07-12T08:37:56.754Z	Elizabeth Asankomah 	abarhbetsie500@gmail.com	548774141	Student	All of the above	I want to be able to be able to use Ai 	WhatsApp
2026-07-12T08:38:39.309Z	Ugwu Priscilla	upriscilla998@gmail.com	22891733456	Student	AI Productivity	Love to learn new things	WhatsApp
2026-07-12T08:49:43.783Z	Kporku Emmanuel Mawuli Kosi	kporkue@gmail.com	557204161	Student	All of the above	I am interested in this whole AI thing and would like to learn more about it 	WhatsApp
2026-07-12T13:46:22.877Z	Amenyo Saviour	amenyosaviour86@gmail.com	557776553	Student	Website Development	I am a building contractor and electrical engineer so using AI to build a website is a beneficiary to my feel of a study. So I want to use the AI to build a website that can help clients to locate the various services that the need and they are requirements.	Friend
2026-07-12T14:11:24.506Z	Stephan Zewuze Ewenam Kofi 	stephanhopeson@gmail.com	500390038	Student	All of the above	As a Biomedical engineering student  I am very well much aware about the demand of software skills in the field	WhatsApp
2026-07-12T20:08:53.751Z	Ayem Rejoice	ayemrejoice123@gmail.com	233595512019	Student	All of the above	For more experience with AI	WhatsApp
2026-07-13T01:58:36.782Z	Daniel Essien Awuah	danielawuahessien@gmail.com	547372876	Student	All of the above	"
I want to learn how to build with AI today and become a builder.
I want to gain valuable digital skills and learn practical workflows I can apply in order to impact my world. "	Friend
2026-07-13T12:31:31.785Z	Kel-kelia Herberts	kelkeliaherberts4@gmail.com	233536765595	Student	AI Productivity	I seek to learn, grow and explore the world of Artificial Intelligence. Also, to impact students on the essence of digital literacy and how to apply it in their studies 	Friend
2026-07-13T13:17:26.218Z	Emmanuel Gyekye	gyekye061@gmail.com	233547496730	Student	All of the above	To improve my skills 	Friend
2026-07-13T18:39:07.212Z	Lavet Gyamfi	lavetgyamfi@gmail.com	233206964705	Student	All of the above	I want to join Sena Academy to build on my software knowledge and skills.	Friend
2026-07-13T18:44:36.666Z	Aggudey Angel Oposika 	angelaggudey0770@gmail.com	233241792669	Student	UI/UX Design	I would love to express my creativity to build and experiment with new things 	Friend
2026-07-13T20:21:09.584Z	Asare Nana Abena Owiredua 	asarenanaabenaowiredua@gmail.com	535727043	Student	All of the above	I want to know how to build with AI and not just be a basic user	WhatsApp
2026-07-14T07:22:19.699Z	Dennis Osei Boakye 	boakyedennis166@gmail.com	242997458	Student	Website Development	Well for a while now , I have had and interest in websites and apps development buh due to lack of ways of learning I haven't been able to do that. And you have just provided an avenue for me to learn.	WhatsApp
2026-07-14T07:52:15.243Z	Oliver Lawerteh	oliverlawerteh@gmail.com	233535612589	Student	All of the above	The world is now and will be a technology world. For you to be part, you need the knowledge of technology 	WhatsApp
2026-07-14T08:17:50.793Z	Kevin Calys-Tagoe 	kcalystagoe@gmail.com	262602619	Student	Website Development	I refuse to be left behind as the times are changing. As such I'd want to equip myself with the necessary skills to stay afloat and make a difference where I find myself 	WhatsApp
2026-07-14T08:37:48.574Z	Elizabeth Ampomah Owusu Asante 	elizabethasanteampomahowusu@gmail.com	531787814	Student	AI Productivity	To be able to work in other sectors aside my field of study.	WhatsApp
2026-07-14T11:18:40.147Z	Sylvester Boadu	boadusylvester2005@gmail.com	233536541562	Student	All of the above	To gain the right training in all these aspect	WhatsApp
2026-07-14T12:16:34.562Z	Cyrilla Yennah Poupele	cyrillayennah2036@gmail.com	233539500780	Student	All of the above	I would love to build more projects to help myself have more skills to be ready for the job market	WhatsApp
2026-07-14T12:25:33.917Z	Theodore Akantuge 	theodoreakantuge2006@gmail.com	531344962	Student	All of the above	To Build myself in the fast growing digital age and solve real world problems.	WhatsApp
2026-07-14T12:30:36.497Z	Richmond Obeng Boateng	obengboateng3133@gmail.com	555758450	Graduate	All of the above	I want to learn the basics of coding and programming as I aspire to apply for a master's in Biological data science and I feel having these skills on my CV would go a long way to help me get  in and make the master's program easier .	WhatsApp
2026-07-14T15:06:12.529Z	Emmanuel Owusu-Poku 	eowusupoku87@gmail.com	233598298859	Student	All of the above	"I'm joining Sena Academy to;1.Level up my tech skills with hands-on experience.
2. Get mentorship & network with industry leaders.
3. Build my own apps & websites by the end of cohort.
4.Secure internship & job opportunities."	WhatsApp
2026-07-15T11:28:21.741Z	PRINCE DZAMESHIE 	heisyaw05@gmail.com	539606136	Student	Website Development	To learn skills on how to create website and many more by knowing the basis and how to create Ai	WhatsApp
2026-07-15T12:03:22.371Z	Benedicta Emefa Abotsi 	beaemefa18@gmail.com	209658211	Student	All of the above	For skills development 	WhatsApp
2026-07-15T13:44:19.567Z	Kasim Muzamil 	deenrisky456@gmail.com	233552267917	Graduate	All of the above	I have a very kin interest in tech and I would want to become an exceptional IT person.	WhatsApp
2026-07-15T14:53:36.427Z	Abban Joshua Ewudzie 	joshuabban504@gmail.com	233594794850	Student	All of the above	I want to join Sena Academy to gain practical skills in Android development, UI/UX, and web development. I'm eager to learn from experienced mentors, work on real projects, and build the skills needed to create impactful digital solutions and grow my career in tech.	WhatsApp
2026-07-15T14:54:25.066Z	Ketura Naa Korkoi Aryaah 	keturaaryaah0504@gmail.com	541489286	Student	All of the above	I want to gain more knowledge about the IT world 	Friend
2026-07-15T16:17:17.779Z	Hodor Jedidiah Sedem	hodorsedem05@gmail.com	532913707	Student	Website Development	Ues	Friend
2026-07-15T16:42:00.651Z	Jael Gifty	giftydomi72@gmail.com	245056526	Student	AI Productivity	Want to gain skills and build my career 	WhatsApp
2026-07-15T17:29:49.221Z	CLIFFORD DONKOR	lyricsticarhymer@gmail.com	233246023579	Student	All of the above	I want to use the opportunity to learn more skills 	WhatsApp
2026-07-15T17:41:02.446Z	Nana Esi Efenaba Appoh	appohnanaesiefenabaappoh@gmail.com	233552428610	Student	All of the above	It's a great opportunity 	WhatsApp
2026-07-15T18:13:15.878Z	Agyemang Joseph Mingle 	josephagyemang828@gmail.com	595687024	Student	Android App Development	To learn new things	Friend
2026-07-15T18:14:13.603Z	Fearon Emma Naa Odey 	emmanaaodeyfearon@gmail.com	261752512	Student	All of the above	I want to build digital skills on ai, build functional websites, create designs and build mobile apps to  solve real problems 	WhatsApp
2026-07-15T19:58:53.338Z	Randy Delali Rockson	randyrockson6@gmail.com	233535982753	Student	Android App Development	Honestly, it was introduced to me by a friend.  I'm yet to test and try and hopefully learn from it 	Friend
2026-07-15T20:17:54.576Z	Elizabeth Adu-Nyamekye 	elizabethnyamekye821@gmail.com	537034881	Student	Android App Development	I want to be productive in this AI evolving world. I want to be able to develop apps especially at the end of this training.	WhatsApp
2026-07-15T23:58:05.731Z	Naba Adu	aduappiahethic@gmail.com	233531867680	Student	All of the above	To be equip with the requisitr	WhatsApp
2026-07-16T20:05:08.688Z	Janet Duah Torto 	janetduah64@gmail.com	551277814	Student	AI Productivity	I want to learn a new skill 	WhatsApp
2026-07-17T00:21:41.418Z	Odei Baah	odeifrancis22@gmail.com	233596339190	Student	All of the above	I wish to know more about artificial intelligent and how it works 	WhatsApp
2026-07-17T10:08:21.201Z	Emmanuel Koranteng	emalon2004@gmail.com	233597870295	Student	All of the above	I want to develop my skills and build good and realistic projects	WhatsApp
2026-07-17T15:11:19.253Z	Christopher Ansah 	chrisansah51@gmail.com	233541830064	Student	Website Development	I’m passionate about technology and want to learn website development at Sena Academy. My goal is to gain hands-on skills, build functional websites, and eventually create digital platforms that make life easier for people.	LinkedIn
2026-07-17T15:50:43.736Z	Kyere Emmanuel kofi	akyeresonscience@gmail.com	233597536842	Student	All of the above	To learn,create,and develop 	WhatsApp
2026-07-19T10:42:06.072Z	FESTUS KUMADO	festuskumado@gmail.com	233246070108	Student	AI Productivity	To help build myself	Other
2026-07-19T11:19:48.767Z	Godfred Nyarko Amoateng	amoatenggodfred2004@gmail.com	593638709	Student	All of the above	I’m joining this cohort because I want to gain practical AI and software development skills, build real projects, and take a confident step toward a career in tech.	Friend
2026-07-20T04:41:47.377Z	James Mawufemor 	jamesmawufemor01@gmail.com	264506064	Other	All of the above	Improve more and gain diverse skills 	WhatsApp
2026-07-20T18:35:56.403Z	 Ati Ebenezer	atiebenezer97@gmail.com	530192387	Student	All of the above	Gain fair knowledge and exposure in digital skills, to actively apply them for real world impact.	WhatsApp
2026-07-21T02:19:52.227Z	Kwabena Frimpong 	emmanueladutwum374@gmail.com	593389517	Graduate	All of the above	To level up my skill set	WhatsApp
2026-07-21T07:56:33.957Z	Dzidzor Seckley	Dzidzorseckley@gmail.com	+233 54 794 0112	Student	All of the above	I want to know more about how to build with AI	WhatsApp
2026-07-21T16:55:37.956Z	Awudu Fuseini 	babroski008@gmail.com	233559288679	Student	All of the above	To learn new skills 	WhatsApp
2026-07-21T17:00:53.737Z	Amoamah Joshua Asare	amoamahjoshua14@gmail.com	233534598963	Student	Website Development	I am a health student specifically,medical laboratory science student, but I have always had a passion to learn how to create webscite and web apps. This led me to learn basic python.	WhatsApp
2026-07-21T17:16:22.326Z	Gyamfi samuel	samuelgyamfi253@gmail.com	591111325	Student	All of the above	After this academy I think I will  be gaining a skills that can help me build a software to help solve some problems we having around us. 	WhatsApp
2026-07-21T17:53:37.746Z	Enchill Delsie Yaw Dwomo Fokuo	enchilldelsie03@gmail.com	536193292	Student	All of the above	To have skills to be self reliant 	Friend
2026-07-21T18:28:01.211Z	Emelia Asalimba 	serwaaabena@gmail.com	536980988	Student	All of the above	I want to join because I am passionate about technology and eager to learn skills in web development, UI/UX design, and Android app development. I see it as a great opportunity to learn, grow, connect with like-minded people, and gain practical skills that will help me in future.	Friend
2026-07-21T20:04:00.627Z	ANTWI ABRAHAM NYARKO 	abrahamantwi51@gmail.com	233557850148	Student	All of the above	To gain insights beyond my current capabilities and knowledge. Exceeding my limits is my priority and substantial goal	WhatsApp
2026-07-21T20:45:21.202Z	George Asubonteng Yaw 	asubontenggeorge416@gmail.com	554337459	Student	All of the above	So as to be able to develop various skills that can make me stand out in the industry 	WhatsApp
2026-07-21T21:08:54.682Z	Joselyn Osei Tiwaa	tiwaajoselyn422@gmail.com	536622103	Student	All of the above	To be able to help others	WhatsApp
2026-07-22T04:06:35.567Z	Godfred Boateng	samuelparker827@gmail.com	539102412	Student	Website Development	I was just introduced to Sena Academy and I want to know how high it can push me 	Friend
2026-07-26T12:06:32.443Z	Frank Junior Asare 	frankjuniorasare@gmail.com	596251366	Student	All of the above	I want to build a tech skills which will make me relevant in the coming years and also be able to build real world problem solving mindset through tech	WhatsApp`;

const lines = rawData.trim().split('\n');
const contacts = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  const parts = line.split('\t').map(p => p.trim());
  if (parts.length < 4) continue;
  
  const name = parts[1];
  const email = parts[2].toLowerCase().trim();
  let phone = parts[3].trim();
  
  if (phone) {
    phone = phone.replace(/[\s\-\(\)]/g, '');
    
    if (phone.startsWith('0')) {
      phone = '233' + phone.substring(1);
    } else if (phone.length === 9 && !phone.startsWith('233')) {
      phone = '233' + phone;
    } else if (phone.startsWith('+')) {
      phone = phone.substring(1);
    }
  }

  if (email && email.includes('@') && phone) {
    contacts.push({
      name: name.trim(),
      email: email,
      phone: phone
    });
  }
}

fs.writeFileSync(
  path.join(__dirname, 'waitlist_contacts.json'),
  JSON.stringify(contacts, null, 2),
  'utf8'
);

console.log(`Successfully parsed ${contacts.length} contacts with phone numbers.`);
