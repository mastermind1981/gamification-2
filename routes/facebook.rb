class Gamification < Sinatra::Application

  # Get all classrooms
  #
  # return [Array] classroom objects
  get '/facebookUser' do
    if authorized?
      content_type :json

      @graph = Koala::Facebook::API.new(session["access_token"])
      user = @graph.get_object("me")
      avatar = @graph.get_picture("me")

      status 200
      return {"username" => user["name"], "id" => user["id"], "avatar" => avatar}.to_json
    else
      status 401
    end
  end
end
