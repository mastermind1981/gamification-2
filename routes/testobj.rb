class Gamification < Sinatra::Application
  post '/testobj/:num' do
    if session['access_token']
      request.body.rewind  # in case someone already read it
      content_type :json

      testobj = Testobj.create(:counter => params[:num])
      return  testobj.to_json
    else
      redirect '/'
    end
  end


  ### list all actions
  get '/testobj' do
    if session['access_token']
      content_type :json
      @testobj = Testobj.all()
      return @testobj.to_json
    else
      redirect '/'
    end
  end
end
