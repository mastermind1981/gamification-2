class Gamification < Sinatra::Application

  # Get all badges
  #
  # return [Array] badge objects
  get '/badge' do
    if authorized?
      content_type :json
      @badge = Badge.all()
      status 200
      return @badge.to_json
    else
      status 401
    end
  end

  # Get a badge by id
  #
  # param [String] the badge id
  #
  # return [Object] badge
  get '/badge/:id' do
    if authorized?
      content_type :json
      badge = Badge.find(params[:id])
      status 200
      return badge.to_json
    else
      status 401
    end
  end

  # Create a new badge
  #
  # return [Object] badge
  post '/badge' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      badge = Badge.create(:time => Time.new().to_i)
      status 200
      return  badge.to_json
    else
      status 401
    end
  end

  # Update a badge by id
  #
  # param [String] the badge id
  #
  # body [Object] in JSON. ex: {"label":"<String>" }
  #
  # return [Object] badge
  put '/badge/:id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      badge = Badge.find(params[:id])

      if badge then
        data = JSON.parse request.body.read

        unless data['description'].nil?
          badge.update_attributes(:description => data['description'])
          badge.save
        end

        unless data['label'].nil?
          badge.update_attributes(:label => data['label'])
          badge.save
        end

        unless data['avatar'].nil?
          badge.update_attributes(:avatar => data['avatar'])
          badge.save
        end

        status 200

        return  badge.to_json
      else
        return {"error" => "Badge "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Delete a badge by id
  #
  # param [String] the badge id
  #
  # return [Object] message
  delete '/badge/:id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      badge = Badge.find(params[:id])

      if badge.destroy then
        status 200
        return {"message" => "Badge "+params[:id]+" deleted"}.to_json
      else
        status 500
        return {"error" => "Badge "+params[:id]+" not deleted"}.to_json
      end
    else
      status 401
      return {"error" => "Not authorised"}.to_json
    end
  end
end
