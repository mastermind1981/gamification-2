class Gamification < Sinatra::Application

  # Get all activities
  #
  # return [Array] activity objects
  get '/activity' do
    if authorized?
      content_type :json
      @activity = Activity.all()
      status 200
      return @activity.to_json
    else
      status 401
    end
  end

  get '/newactivities' do
    if authorized?
      content_type :json
      @activity = Activity.desc(:time).limit(3);
      status 200
      return @activity.reverse.to_json
    end
  end

  # Get a activity by id
  #
  # param [String] the activity id
  #
  # return [Object] activity
  get '/activity/:id' do
    if authorized?
      content_type :json
      activity = Activity.find(params[:id])
      status 200
      return activity.to_json
    else
      status 401
    end
  end

  # Create a new activity
  #
  # return [Object] activity
  post '/activity' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      activity = Activity.create(:time => Time.new().to_i)
      status 200
      return  activity.to_json
    else
      status 401
    end
  end

  # Update a activity by id
  #
  # param [String] the activity id
  #
  # body [Object] in JSON. ex: {"label":"<String>" }
  #
  # return [Object] activity
  put '/activity/:id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      activity = Activity.find(params[:id])

      if activity then
        data = JSON.parse request.body.read

        unless data['type'].nil?
          activity.update_attributes(:type => data['type'])
          activity.save
        end

        unless data['label'].nil?
          activity.update_attributes(:label => data['label'])
          activity.save
        end

        unless data['url'].nil?
          activity.update_attributes(:url => data['url'])
          activity.save
        end

        unless data['studentId'].nil?
          activity.update_attributes(:studentId => data['studentId'])
          activity.save
        end

        unless data['groupId'].nil?
          activity.update_attributes(:groupId => data['groupId'])
          activity.save
        end

        if data['type'] == 'STUDENT' then
          student = Student.where(:facebookId => data['studentId']).first()
          activity.update_attributes(:ownerName => student.firstName + ' ' +student.lastName)
          activity.update_attributes(:ownerAvatar => student.avatar)
          activity.save
        end

        status 200

        return  activity.to_json
      else
        return {"error" => "Activity "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Delete a activity by id
  #
  # param [String] the activity id
  #
  # return [Object] message
  delete '/activity/:id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      activity = Activity.find(params[:id])

      if activity.destroy then
        status 200
        return {"message" => "Activity "+params[:id]+" deleted"}.to_json
      else
        status 500
        return {"error" => "Activity "+params[:id]+" not deleted"}.to_json
      end
    else
      status 401
      return {"error" => "Not authorised"}.to_json
    end
  end
end
