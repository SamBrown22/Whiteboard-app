# WhiteBoard Application

This application aims for real-time collaboration between users using sockets.

## UI section

Currently, the UI will enable the user to interact with a board class. This is accessed through a container. Using the board class 
it can receive properties from the container allowing it to use these parameters to enable targetted drawing modes for users. 
The UI also interacts with the sockets to emit signals to allow communication between the server and clients.

## Server

On starting the server it will try to connect to a MongoDB container as well as open a connection for clients to join.
Upon a connection, the server will then send a signal to that individual socket to perform a canvas construction using 
the objects stored in the database. It will also define and enable signals to be received from that socket from that connection. 
Enabling it to receive communication and broadcast signals to the other users.


