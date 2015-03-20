require 'sinatra'

set :public_folder, File.join(File.dirname(__FILE__), 'public')

get '/' do
  redirect 'index.html'
end
