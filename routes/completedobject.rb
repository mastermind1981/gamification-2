class Gamification < Sinatra::Application

  # Get all completedobjects
  #
  # return [Array] completedobject objects
  get '/completedobject' do
    if authorized?
      content_type :json
      @completedobject = Completedobject.all()
      status 200
      return @completedobject.to_json
    else
      status 401
    end
  end

  # Get a completedobject by id
  #
  # param [String] the completedobject id
  #
  # return [Object] completedobject
  get '/completedobject/:id' do
    if authorized?
      content_type :json
      completedobject = Completedobject.find(params[:id])
      status 200
      return completedobject.to_json
    else
      status 401
    end
  end

  # Create a new completedobject
  #
  # return [Object] completedobject
  post '/completedobject' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      completedobject = Completedobject.create()
      status 200
      return  completedobject.to_json
    else
      status 401
    end
  end

  # Update a completedobject by id
  #
  # param [String] the completedobject id
  #
  # body [Object] in JSON. ex: {"group_id":"<String>", "user_id":"<String>", "text":"<String>", "finished_on":"<Integer>" }
  #
  # return [Object] completedobject
  put '/completedobject/:id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      completedobject = Completedobject.find(params[:id])

      if completedobject then
        data = JSON.parse request.body.read

        unless data['group_id'].nil?
          completedobject.update_attributes(:label => data['group_id'])
          completedobject.save
        end

        unless data['user_id'].nil?
          completedobject.update_attributes(:introduction => data['user_id'])
          completedobject.save
        end

        unless data['text'].nil?
          completedobject.update_attributes(:introduction => data['text'])
          completedobject.save
        end

        unless data['finished_on'].nil?
          completedobject.update_attributes(:introduction => data['finished_on'])
          completedobject.save
        end

        status 200

        return  completedobject.to_json
      else
        return {"error" => "Completedobject "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end


  # Delete a completedobject by id
  #
  # param [String] the completedobject id
  #
  # return [Object] message
  delete '/completedobject/:id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      completedobject = Completedobject.find(params[:id])

      if completedobject.destroy then
        status 200
        return {"message" => "Completedobject "+params[:id]+" deleted"}.to_json
      else
        status 500
        return {"error" => "Completedobject "+params[:id]+" not deleted"}.to_json
      end
    else
      status 401
      return {"error" => "Not authorised"}.to_json
    end
  end
end
