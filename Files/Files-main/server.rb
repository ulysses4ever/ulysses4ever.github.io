#!/usr/bin/ruby

#на любой HTTP-запрос этот сервер отправляет HTTP-ответ с единственной буквой в теле - 7й буквой запроса

require "celluloid/current"
require "celluloid/io" #event based TCPServer instead of TCPServer in 'soket'

class Server
  include Celluloid::IO
  finalizer :shutdown

  def initialize(serverPort)
    @serverSocket = TCPServer.new("0.0.0.0", serverPort)
    @serverSocket.listen(10000)
    @concurrentClientCount = 0
    async.acceptLoop
  end

  def acceptLoop
    loop { async.processClient @serverSocket.accept }
  end

  def processClient(clientSocket)
    begin
      @concurrentClientCount += 1
      puts "#{@concurrentClientCount} concurrent clients are connected"
      #неполный запрос от клиентов (продолжение которого еще не доставилось по сети)
      dataForProcessing = ""
      answer = "HTTP/1.1 200 OK\nServer: super fast mexmat server\nContent-Type: text/html\nContent-Length: 1\n\nA"
      loop do
        queries = dataForProcessing + clientSocket.recv(100000)
        queries = queries.split("\n\n",-1)
        dataForProcessing = queries[-1]
        queries.delete_at(-1);
        queries.each do |query|
          answer[-1] = query[7]
          clientSocket << answer
        end
      end
    rescue EOFError
      clientSocket.close rescue nil
      @concurrentClientCount -= 1
    rescue Exception => e
      puts "There was exception: " + e.to_s + "<br/>\n"+e.backtrace.to_s
      shutdown
    end
  end

  def shutdown
    @serverSocket.close rescue nil
  end
end

server = Server.new(28563)
#ждем нажатия клавиши (ввода строки)
gets
server.shutdown
