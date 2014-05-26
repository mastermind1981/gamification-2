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
require 'open-uri'


class Gamification < Sinatra::Application
  include BCrypt

  use Rack::Session::Cookie, secret: 'qwertyuiop123456asdfghjkl'
  # :expire_after => 60  #expire after 1 minute
  # :expire_after => 60 * 60 * 24,  #expire after 1 day
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

  helpers do
    def authorized?
=begin
      if ENV['XMPP_SERVER'].nil? then
        return true
      else
        if session['access_token']
          return true
        end
          return false
      end
=end
      return true
    end

    def HTTPauthorized?
        if session['access_token']
          return true
        else
          return false
        end
    end

    def daysec
      # Return the timestamp of 00:00 (day number) of the current day
      tday = Time.now;
      return Time.local(tday.year, tday.month, tday.day, 0,0,0).to_i
    end

    def weeksec
      # Return the timestamp of the monday 00:00 (day number) of the current week
      tday = Time.now;
      lastmondy = tday.to_i - (86400 * (tday.strftime("%u").to_i - 1));
      timemondy = Time.at(lastmondy);

      return Time.local(timemondy.year, timemondy.month, timemondy.day, 0,0,0).to_i
    end
  end

  # Executes a login
  get '/d' do
    return daysec.to_s;
  end


  # Executes a login
  get '/login' do
    session['oauth'] = Koala::Facebook::OAuth.new(ENV['APP_ID'], ENV['APP_SECRET'], "#{request.base_url}/callback")
    redirect session['oauth'].url_for_oauth_code()
  end

  # Executes a logout
  get '/logout' do
    session['oauth'] = nil
    session['access_token'] = nil
    redirect '/loginsso.html'
  end

  # Handle the redirect from facebook back to you
  get '/callback' do
    session['access_token'] = session['oauth'].get_access_token(params[:code])
    redirect '/'
  end

  # Get the index page if authenticated, else the login page
  get '/' do
    if HTTPauthorized?
      @graph = Koala::Facebook::API.new(session["access_token"])
      @user = @graph.get_object("me")

      student = Student.find_by(facebookId: @user["id"])
      unless student then
        Student.create(:facebookId => @user["id"])
      end

      send_file File.join('private', 'index.html')
    else
      redirect '/loginsso.html'
    end
  end

  # Get the index page for the api documentation
  get '/api' do
    redirect '/api/index.html'
  end


  # Get the index.html page
  get '/index.html' do
    if HTTPauthorized?
      send_file File.join('private', 'index.html')
    else
      redirect '/'
    end
  end

  # Get the f.html page
  get '/about.html' do
    if HTTPauthorized?
      send_file File.join('private', 'about.html')
    else
      redirect '/'
    end
  end

  # Get the f.html page
  get '/a.html' do
    if HTTPauthorized?
      @graph = Koala::Facebook::API.new(session["access_token"])
      @user = @graph.get_object("me")

      student = Student.find_by(facebookId: @user["id"])
      if student['admin']
        send_file File.join('private', 'a.html')
      else
        redirect '/'
      end
    else
      redirect '/'
    end
  end

  # Get the blank.html page
  get '/blank.html' do
    if HTTPauthorized?
      send_file File.join('private', 'blank.html')
    else
      redirect '/'
    end
  end

  # Get the blank.html page
  get '/modal.html' do
    if HTTPauthorized?
      send_file File.join('private', 'modal.html')
    else
      redirect '/'
    end
  end

end

require_relative 'routes/init'
require_relative 'models/init'