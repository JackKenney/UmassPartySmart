UMASS PARTY SMART
====================================================
by Jack Kenney and David Chen
----------------------------------
UMass Party Smart is a web app designed for UMass students living off-campus to register their parties. By doing so, students get a text alert whenever neighbors are about to call the police, and a courtesy call from the police when they receive a noise complaint at the host address. As a bonus, all students who register their parties receive free toilet paper and water. It also provides residents an anonymous way to ask party hosts to quiet down, and provides the police a database of registered parties so they can give advance warning to the hosts before they come. In our current version, we have implemented 4 pages:

The Party Register page is where the host can register his or her party. He simply provides his contact information, address, time and date of the party, and he's all set to go. The information is sent to a MySQL Database where we store all of the registered parties.

On the Complaint page, residents can send an anonymous text to hosts asking them to quiet down. By inputting their address and the party address, we calculate whether or not the party is within a quarter-mile radius of the resident. If it is, then an automated text is sent to the phone number of the registered party in the database.

On the Police form page, authorities can input the address of where a noise complaint was received, and if there is a registered party there, they receive the phone numbers registered to that address. This allows authorities to warn the party hosts that they are coming and that it's time to end the party.

The Delivery page is for the delivery driver. It gives him a list of all the parties on that date, sorted from earliest to latest. Then, he can check off the parties of which he already delivered the water and toilet paper to.

Our web app is still a prototype right now, but the methods are all functional.
