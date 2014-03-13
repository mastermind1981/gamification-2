class Gamification < Sinatra::Application

  # Get all levels
  #
  # return [Array] level objects
  get '/level' do
    if authorized?
      content_type :json
      @level = Level.all()
      status 200
      return @level.to_json
    else
      status 401
    end
  end

  # Get a level by id
  #
  # param [String] the level id
  #
  # return [Object] level
  get '/level/:id' do
    if authorized?
      content_type :json
      level = Level.find(params[:id])
      status 200
      return level.to_json
    else
      status 401
    end
  end

  # Create a new level
  #
  # return [Object] level
  post '/level' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      level = Level.create()
      status 200
      return  level.to_json
    else
      status 401
    end
  end

  # Update a level by id
  #
  # param [String] the level id
  #
  # body [Object] in JSON. ex: {"label":"<String>" }
  #
  # return [Object] level
  put '/level/:id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      level = Level.find(params[:id])

      if level then
        data = JSON.parse request.body.read

        unless data['label'].nil?
          level.update_attributes(:label => data['label'])
          level.save
        end

        unless data['introduction'].nil?
          level.update_attributes(:introduction => data['introduction'])
          level.save
        end

        status 200

        return  level.to_json
      else
        return {"error" => "Level "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Add a task to a level by id
  #
  # param [String] the level id
  #
  # param [String] the task id
  #
  # return [Object] level
  put '/level/:id/addtask/:taskid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      level = Level.find(params[:id])

      if level then

        begin
          task = Task.find(params[:taskid])
        end

        if task
          level.tasks << task
          level.save
        else
          status 500
          return {"error" => "Task "+params[:taskid]+" not found"}.to_json
        end

        status 200

        return  level.to_json
      else
        return {"error" => "Level "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Remove a task from a level by id
  #
  # param [String] the level id
  #
  # param [String] the task id
  #
  # return [Object] level
  put '/level/:id/removetask/:taskid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      level = Level.find(params[:id])

      if level then

        begin
          task = Task.find(params[:taskid])
        end

        if task
          level.tasks.delete(task)
          level.save
        else
          status 500
          return {"error" => "Task "+params[:taskid]+" not found"}.to_json
        end

        status 200

        return  level.to_json
      else
        return {"error" => "Level "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Add a completed group to a level by id
  #
  # param [String] the level id
  #
  # body [Object] in JSON. ex: {"group_id":"<String>", "user_id":"<String>", "text":"<String>", "finished_on":"<String>" }
  #
  # return [Object] level
  put '/level/:id/addcompletedgroup' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      level = Level.find(params[:id])

      if level then
        data = JSON.parse request.body.read

        unless data.nil? or data['group_id'].nil? then
          begin
            group = Group.find(data['group_id'])
          end

          if group
            completedobject = Completedobject.create(:text => data['text'], :user_id => data['user_id'], :group_id => data['group_id'], :finished_on => data['finished_on']);
            level.completedobjects << completedobject
            level.save
            status 200
            return  level.to_json
          else
            status 500
            return {"error" => "Group "+data['group_id']+" not found"}.to_json
          end

        else
          status 500
          return {"error" => "Group id missing"}.to_json
        end
      else
        return {"error" => "Level "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end


  # Delete a level by id
  #
  # param [String] the level id
  #
  # return [Object] message
  delete '/level/:id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      level = Level.find(params[:id])

      if level.tasks.empty? then
        if level.destroy then
          status 200
          return {"message" => "Level "+params[:id]+" deleted"}.to_json
        else
          status 500
          return {"error" => "Level "+params[:id]+" not deleted"}.to_json
        end
      else
        status 401
        return {"error" => "This level has tasks. Delete those first before deleting this level."}.to_json
      end
    else
      status 401
      return {"error" => "Not authorised"}.to_json
    end
  end
end