class Gamification < Sinatra::Application
  post '/testobj/:num' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      testobj = Testobj.create(:counter => params[:num])
      status 200
      return  testobj.to_json
    else
      status 401
    end
  end


  ### list all actions
  get '/testobj' do
    if authorized?
      content_type :json
      @testobj = Testobj.all()
      status 200
      return @testobj.to_json
    else
      status 401
    end
  end
end
