class Gamification < Sinatra::Application
  post '/testobj/:num' do

      request.body.rewind  # in case someone already read it
      content_type :json

      testobj = Testobj.create(:counter => params[:num])
      return  testobj.to_json
  end


  ### list all actions
  get '/testobj' do
      content_type :json
      @testobj = Testobj.all()
      return @testobj.to_json
  end
end
