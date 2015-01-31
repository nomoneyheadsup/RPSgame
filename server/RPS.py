class CHARA:
    ROCK = 1; PAPER = 2; SCISSORS = 3;
CHARAS = [CHARA.ROCK, CHARA.PAPER, CHARA.SCISSORS]

class THROW:
    EMPTY_THROW = 0; ROCK = 1; PAPER = 2; SCISSORS = 3; NO_THROW = 4;
THROWS = [THROW.EMPTY_THROW, THROW.ROCK, THROW.PAPER, THROW.SCISSORS]

class Player:
    def __init__(self, name, character, connection):
        self.name = name
        self.character = character
        self.connection = connection
        self.hp = 150
        self.human = True
        self.throw = THROW.NO_THROW
        
def DefaultPlayer():
    player = Player(None, None, None)
    player.human = False
    return player
        
class Game:
    def __init__(self):
        self.p1 = DefaultPlayer()
        self.p2 = DefaultPlayer()
        self.spectators = [] # max 10
        self.gameID = None
        
    def ConnectionPlayer(self, connection):
        if connection == self.p1.connection:
            return self.p1
        elif connection == self.p2.connection:
            return self.p2
        else:
            return None
        
    # atm, cannot take player out without killing the game
    def AddPlayer1(self, connection, name, character):
        if not self.p1.human:
            self.p1 = Player(name, character, connection)
            return True
        else:
            return False
        
    def AddPlayer2(self, connection, name, character):
        if not self.p2.human:
            self.p2 = Player(name, character, connection)
            return True
        else:
            return False
        
    def AddPlayer(self, slot, connection, name, character):
        if slot == 0:
            return self.AddPlayer1(connection, name, character)
        else:
            return self.AddPlayer2(connection, name, character)
        
    def ReadyToStart(self):
        if self.p1.human and self.p2.human:
            return True
        return False
        
    def SendGameStart(self):
        # send info of opponent: name, character
        # send game_start
        sendID = 4
        gameID = self.gameID
        name1 = map(ord, self.p1.name)
        name2 = map(ord, self.p2.name)
        packet1 = [sendID, gameID, 1, self.p2.character] + name2
        packet2 = [sendID, gameID, 2, self.p1.character] + name1
        SendPacket(self.p1.connection, packet1, opcode = sendID)
        SendPacket(self.p2.connection, packet2, opcode = sendID)
        
    def SendSpectatorInitInfo(self, connection):
        # TODO
        pass
        
    def AddSpectator(self, connection):
        if len(spectators) < 10:
            self.spectators.append(connection)
            self.SendSpectatorInitInfo(connection)
            return True
        else:
            return False
        
    def RemoveSpectator(self, connection):
        self.spectators.remove(connection)
        
    def GetGameInfo(self):
        MAX_SPECTATORS = 10
        info = [0, 0, len(self.spectators), MAX_SPECTATORS]
        if self.p1.human:
            info[0] = 1
        if self.p2.human:
            info[1] = 1
        return info
    
    def HasPlayer(self, connection):
        if connection in [self.p1.connection, self.p2.connection] + self.spectators:
            return True
        else:
            return False
        
    def KickPlayer(self, p):
        sendID = 6
        packet = [sendID]
        SendPacket(p.connection, packet, opcode = sendID)
        
    def KickAllSpectators(self):
        sendID = 6
        packet = [sendID]
        for spectator in self.spectators:
            SendPacket(spectator, packet, opcode = sendID)
            
        self.spectator = []
        
    def RemovePlayer(self, connection):
        if self.p1.connection == connection:
            self.p1 = DefaultPlayer()
            if self.p2.human:
                self.KickPlayer(self.p2)
                self.p2 = DefaultPlayer()
            self.KickAllSpectators()
        if self.p2.connection == connection:
            self.p2 = DefaultPlayer()
            if self.p1.human:
                self.KickPlayer(self.p1)
                self.p1 = DefaultPlayer()
            self.KickAllSpectators()
        if connection in self.spectators:
            self.spectators.remove(connection)
            
    def SendFinalThrows(self):
        sendID = 5
        gameID = self.gameID
        packet1 = [sendID, gameID, self.p2.throw]
        packet2 = [sendID, gameID, self.p1.throw]
        
        self.p1.throw = THROW.NO_THROW
        self.p2.throw = THROW.NO_THROW
        
        SendPacket(self.p1.connection, packet1, opcode = sendID)
        SendPacket(self.p2.connection, packet2, opcode = sendID)
        
    def FinalizeThrow(self, connection, finalThrow):
        p = self.ConnectionPlayer(connection)
        p.throw = finalThrow
        
        if self.p1.throw in THROWS and self.p2.throw in THROWS:
            self.SendFinalThrows()
        
onlyGame = Game()
games = [onlyGame]
for index, game in enumerate(games):
    game.gameID = index

def IsPlayerInAnyGame(connection):
    for game in games:
        if game.HasPlayer(connection):
            return True
    return False

def DeletePlayerFromAllGames(connection):
    for game in games:
        game.RemovePlayer(connection)
            
def GetGame(gameID):
    if (len(games) - 1) < gameID:
        return None
    return games[gameID]

def GetGameStatus(connection, packet):
    if len(packet) != 2:
        return
    gameID = packet[1]
    game = GetGame(gameID)
    if game is None:
        return
    game = games[gameID]
    info = game.GetGameInfo()
    
    sendID = 1
    SendPacket(connection, [sendID, gameID] + info, opcode = sendID)
    
def SendPacket(connection, byteList, opcode = None):
    response = str(bytearray(byteList))
    connection.write_message(response, binary = True)
    DBG_OPCODE = [2, 4]
    if opcode in DBG_OPCODE:
        print('Sent: ' + str(byteList))
    
def ExtractPlayerName(joinAsPlayerPacket):
    if len(joinAsPlayerPacket) == 4:
        return ""
    name = joinAsPlayerPacket[4:]
    name = map(chr, name)
    return ''.join(name)
    
def JoinAsPlayer(connection, packet): # return success or error (error should be interpreted as slot full)
    if len(packet) < 4:
        print('ERROR: Bad JoinAsPlayer packet')
        return
    gameID = packet[1]
    playerSlot = packet[2]
    chara = packet[3]
    name = ExtractPlayerName(packet)
    if playerSlot not in [0, 1]:
        return
    game = GetGame(gameID)
    if game is None:
        print('ERROR: Attempt to join nonexisting game')
        return
    if IsPlayerInAnyGame(connection):
        print('ERROR: Player already in game')
        return
    if chara not in CHARAS:
        print('ERROR: Bad character selected')
        return
    print('Attempting to add player to slot ' + str(playerSlot))
    if game.AddPlayer(playerSlot, connection, name, chara):
        success = 1
    else:
        success = 0
    
    sendID = 2
    SendPacket(connection, [sendID, gameID, playerSlot + 1, success], opcode = sendID)
    
    if game.ReadyToStart():
        game.SendGameStart()
    
def JoinAsSpectator(connection, packet): # return success or error (error should be interpreted as all slots full)
    if len(packet) != 2:
        return
    gameID = packet[1]    
    game = GetGame(gameID)
    if game is None:
        return
    if game.AddSpectator(connection):
        success = 1
    else:
        success = 0
        
    sendID = 3
    response = bytearray([sendID, gameID, success])        
    connection.write_message(response, binary = True)
    
def FinalizeThrow(connection, packet):
    if len(packet) != 3:
        return
    gameID = packet[1]
    finalThrow = packet[2]
    game = GetGame(gameID)
    if game is None:
        return
    if finalThrow not in THROWS:
        return
    game.FinalizeThrow(connection, finalThrow)
    
def ExitGame(connection, packet):
    if len(packet) != 2:
        return
    gameID = packet[1]
    game = GetGame(gameID)
    if game is None:
        return    
    game.RemovePlayer(connection)
     
PACKET_PARSERS = {1 : GetGameStatus, 2 : JoinAsPlayer, 3 : JoinAsSpectator,
                  4: FinalizeThrow, 5: ExitGame}
RECV_OPCODES = [key for key in PACKET_PARSERS]

def ParsePacket(connection, packet):
    if len(packet) < 1:
        return
    opcode = packet[0]
    if opcode not in RECV_OPCODES:
        print('ERROR: non-existing opcode received')
        return
    Parser = PACKET_PARSERS[opcode]
    Parser(connection, packet)