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

  # Get all activities for a classroom
  #
  # return [Array] activity objects
  get '/activities/:classid' do
    if authorized?
      content_type :json
      @activity = Activity.where(:classroomId => params[:classid])
      status 200
      return @activity.to_json
    else
      status 401
    end
  end

  get '/newactivities/:classid' do
    if authorized?
      content_type :json
      @activity = Activity.where(:classroomId => params[:classid]).desc(:time).limit(10);
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


  # Create a new described activity
  #
  # return [Object] activity
  post '/dactivity' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json
      data = JSON.parse request.body.read

      if data then
        activity = Activity.create(:time => Time.new().to_i, :label => data['label'], :type => data['type'], :classroomId => data['classroomId'], :groupId => data['groupId'], :badgeId => data['badgeId'], :ownerName => data['ownerName'])
      end

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

        unless data['classroomId'].nil?
          activity.update_attributes(:classroomId => data['classroomId'])
          activity.save
        end

        unless data['groupId'].nil?
          activity.update_attributes(:groupId => data['groupId'])
          activity.save
        end

        unless data['badgeId'].nil?
          activity.update_attributes(:badgeId => data['badgeId'])
          activity.save
        end

        if data['type'] == 'STUDENT' then
          @graph = Koala::Facebook::API.new(session["access_token"])
          user = @graph.get_object(data['studentId'])
          avatar = @graph.get_picture(data['studentId'])

          activity.update_attributes(:ownerName => user["first_name"] + ' ' +user["last_name"])
          activity.update_attributes(:ownerAvatar => avatar)
          activity.save
        end

        if data['type'] == 'GROUP' then
          group = Group.find(data['groupId']);

          activity.update_attributes(:ownerName => group.label)
          activity.update_attributes(:ownerAvatar => group.avatarUrl)
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
