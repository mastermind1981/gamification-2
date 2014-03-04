require 'sinatra'
require 'mongoid'
require 'digest'
require 'uri'
require 'json'
require 'fileutils'
#require 'aws/s3'
require 'securerandom'
require 'logger'
require 'bcrypt'
require 'koala'


class Gamification < Sinatra::Application
  include BCrypt

  use Rack::Session::Cookie, secret: 'qwertyuiop123456asdfghjkl'
  #  :expire_after => 60 * 60 * 24,  #expire after 1 day
  #  :secret => 'asadbb2342923222f1adc05c834fa234230e3494b93824b10e930bb0fb89b'

  set :environment, :production
  set :public_folder, 'public'

  configure do
    set :app_file, __FILE__
    Mongoid.load! "#{File.dirname(__FILE__)}/config/mongoid.yml"
  end

  configure :development do
    enable :logging, :dump_errors, :raise_errors
  end

  configure :production do
    set :raise_errors, false #false will show nicer error page
    set :show_exceptions, false #true will ignore raise_errors and display backtrace in browser
  end

  get '/' do
    if session['access_token']
      # @graph = Koala::Facebook::GraphAPI.new(session["access_token"])
      redirect '/index.html?at='+session["access_token"]
    else
      redirect '/login.html'
    end
  end

  get '/login' do
    # generate a new oauth object with your app data and your callback url
    session['oauth'] = Koala::Facebook::OAuth.new(ENV['APP_ID'], ENV['APP_SECRET'], "#{request.base_url}/callback")
    # redirect to facebook to get your code
    redirect session['oauth'].url_for_oauth_code()
  end

  get '/logout' do
    session['oauth'] = nil
    session['access_token'] = nil
    redirect '/'
  end

  #method to handle the redirect from facebook back to you
  get '/callback' do
    #get the access token from facebook with your code
    session['access_token'] = session['oauth'].get_access_token(params[:code])
    redirect '/'
  end

end

require_relative 'routes/init'
require_relative 'models/init'