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

  # Get all levels
  #
  # return [Array] level objects
  get '/adminlevel' do
    if authorized?
      content_type :json

      @graph = Koala::Facebook::API.new(session["access_token"])
      user = @graph.get_object("me")

      @level = Level.where(:author => user["id"])
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

      @graph = Koala::Facebook::API.new(session["access_token"])
      user = @graph.get_object("me")

      level = Level.create(:author => user["id"])
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

        unless data['order'].nil?
          level.update_attributes(:order => data['order'])
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
  # body [Object] in JSON. ex: {"groupId":"<String>", "userId":"<String>", "text":"<String>", "finishedOn":"<String>" }
  #
  # return [Object] level
  put '/level/:id/addcompletedgroup' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      level = Level.find(params[:id])

      if level then
        data = JSON.parse request.body.read

        unless data.nil? or data['groupId'].nil? then
          begin
            group = Group.find(data['groupId'])
          end

          if group
            #make group does not re-submit a task completion
            retrievedCompletedobject = Completedobject.where(:level_id => params[:id], :groupId => data['groupId']).length

            if retrievedCompletedobject == 0 then
              completedobject = Completedobject.create(:text => data['text'], :userId => data['userId'], :groupId => data['groupId'], :finishedOn => Time.new().to_i);
              level.completedobjects << completedobject
              level.save
            end

            status 200
            return  level.to_json
          else
            status 500
            return {"error" => "Group "+data['groupId']+" not found"}.to_json
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

  # Lock a level by id
  #
  # param [String] the level id
  #
  # body [Object] in JSON. ex: {"label":"<String>" }
  #
  # return [Object] level
  put '/level/:id/lock' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      level = Level.find(params[:id])

      if level then
       level.update_attributes(:locked => true)
       level.save

       status 200

        return  level.to_json
      else
        return {"error" => "Level "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Unlock a level by id
  #
  # param [String] the level id
  #
  # body [Object] in JSON. ex: {"label":"<String>" }
  #
  # return [Object] level
  put '/level/:id/unlock' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      level = Level.find(params[:id])

      if level then
        level.update_attributes(:locked => false)
        level.save

        status 200

        return  level.to_json
      else
        return {"error" => "Level "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end


  # Add an id to unlock to a level by id
  #
  # param [String] the level id
  #
  # body [Object] in JSON. ex: {"unid":"<String>", "type":"<String>" ("LEVEL/"QUEST") }
  #
  # return [Object] level
  put '/level/:id/addidtounlock' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      level = Level.find(params[:id])

      if level then

        doNotExists = true;
        data = JSON.parse request.body.read

        level.idstounlock.each do |idd|
          if idd["unid"] == data['unid'] then
            doNotExists = false;
          end
        end

        if doNotExists then
          level.idstounlock << {:unid => data['unid'], :type => data['type']}
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

  # Remove an id to unlock to a level by id
  #
  # param [String] the level id
  #
  # body [Object] in JSON. ex: {"label":"<String>" }
  #
  # return [Object] level
  put '/level/:id/removeidtounlock/:unid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      level = Level.find(params[:id])

      if level then

        data = JSON.parse request.body.read

        level.idstounlock.each do |idd|
          if idd["unid"] == data['unid'] then
            level.idstounlock.delete(idd)
          end
        end

        level.save!

        status 200

        return  level.to_json
      else
        return {"error" => "Level "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Add a badge id to deliver after a level by id
  #
  # param [String] the level id
  #
  # param [String] the badge id
  #
  # return [Object] level
  put '/level/:id/addbadge/:badgeid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      level = Level.find(params[:id])
      badge = Badge.find(params[:badgeid])

      if level && badge then

        doNotExists = true;

        level.badges.each do |bad|
          if bad.to_s == params[:badgeid] then
            doNotExists = false;
            break;
          end
        end

        if doNotExists then
          level.badges << params[:badgeid]
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

  # Remove a badge id to deliver after a level by id
  #
  # param [String] the level id
  #
  # param [String] the badge id
  #
  # return [Object] level
  put '/level/:id/removebadge/:badgeid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      level = Level.find(params[:id])
      badge = Badge.find(params[:badgeid])

      if level && badge then

        level.badges.each do |bad|
          if bad.to_s == params[:badgeid] then
            level.badges.delete(params[:badgeid])
            break;
          end
        end

        level.save!

        status 200

        return  level.to_json
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
