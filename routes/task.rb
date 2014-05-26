class Gamification < Sinatra::Application

  # Get all tasks
  #
  # return [Array] task objects
  get '/task' do
    if authorized?
      content_type :json
      @task = Task.all()
      status 200
      return @task.to_json
    else
      status 401
    end
  end

  # Get all tasks
  #
  # return [Array] task objects
  get '/admintask' do
    if authorized?
      content_type :json

      @graph = Koala::Facebook::API.new(session["access_token"])
      user = @graph.get_object("me")

      @task = Task.where(:author => user["id"])
      status 200
      return @task.to_json
    else
      status 401
    end
  end

  # Get a task by id
  #
  # param [String] the task id
  #
  # return [Object] task
  get '/task/:id' do
    if authorized?
      content_type :json
      task = Task.find(params[:id])
      status 200
      return task.to_json
    else
      status 401
    end
  end

  # Create a new task
  #
  # return [Object] task
  post '/task' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      @graph = Koala::Facebook::API.new(session["access_token"])
      user = @graph.get_object("me")

      task = Task.create(:author => user["id"])
      status 200
      return  task.to_json
    else
      status 401
    end
  end

  # Update a task by id
  #
  # param [String] the task id
  #
  # body [Object] in JSON. ex: {"label":"<String>" }
  #
  # return [Object] task
  put '/task/:id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      task = Task.find(params[:id])

      if task then
        data = JSON.parse request.body.read

        unless data['label'].nil?
          task.update_attributes(:label => data['label'])
          task.save
        end

        unless data['introduction'].nil?
          task.update_attributes(:introduction => data['introduction'])
          task.save
        end

        unless data['order'].nil?
          task.update_attributes(:order => data['order'])
          task.save
        end

        unless data['isblogurltask'].nil?
          task.update_attributes(:isblogurltask => data['isblogurltask'])
          task.save
        end

        status 200

        return  task.to_json
      else
        return {"error" => "Task "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Add a completed group to a task by id
  #
  # param [String] the task id
  #
  # body [Object] in JSON. ex: {"groupId":"<String>", "userId":"<String>", "text":"<String>", "finishedOn":"<String>" }
  #
  # return [Object] task
  put '/task/:id/addcompletedgroup' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      task = Task.find(params[:id])

      if task then
        data = JSON.parse request.body.read

        unless data.nil? or data['groupId'].nil? then
          begin
            group = Group.find(data['groupId'])
          end

          if group

            #make group does not re-submit a task completion
            retrievedCompletedobject = Completedobject.where(:task_id => params[:id], :groupId => data['groupId']).length

            if retrievedCompletedobject == 0 then
              completedobject = Completedobject.create(:text => data['text'], :userId => data['userId'], :groupId => data['groupId'], :finishedOn => Time.new().to_i);
              task.completedobjects << completedobject
              task.save
            end

            status 200
            return  task.to_json
          else
            status 500
            return {"error" => "Group "+data['groupId']+" not found"}.to_json
          end

        else
          status 500
          return {"error" => "Group id missing"}.to_json
        end
      else
        return {"error" => "Task "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Add an id to unlock to a task by id
  #
  # param [String] the task id
  #
  # body [Object] in JSON. ex: {"label":"<String>" }
  #
  # return [Object] task
  put '/task/:id/addidtounlock' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      task = Task.find(params[:id])

      if task then

        doNotExists = true;
        data = JSON.parse request.body.read

        task.idstounlock.each do |idd|
          if idd["unid"] == data['unid'] then
            doNotExists = false;
          end
        end

        if doNotExists then
          task.idstounlock << {:unid => data['unid'], :type => data['type']}
          task.save
        end

        status 200

        return  task.to_json
      else
        return {"error" => "Task "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Remove an id to unlock to a task by id
  #
  # param [String] the task id
  #
  # body [Object] in JSON. ex: {"label":"<String>" }
  #
  # return [Object] task
  put '/task/:id/removeidtounlock/:unid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      task = Task.find(params[:id])

      if task then

        data = JSON.parse request.body.read

        task.idstounlock.each do |idd|
          if idd["unid"] == data['unid'] then
            task.idstounlock.delete(idd)
          end
        end

        task.save!

        status 200

        return  task.to_json
      else
        return {"error" => "Task "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Add a badge id to deliver after a task by id
  #
  # param [String] the task id
  #
  # param [String] the badge id
  #
  # return [Object] task
  put '/task/:id/addbadge/:badgeid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      task = Task.find(params[:id])
      badge = Badge.find(params[:badgeid])

      if task && badge then

        doNotExists = true;

        task.badges.each do |bad|
          if bad.to_s == params[:badgeid] then
            doNotExists = false;
            break;
          end
        end

        if doNotExists then
          task.badges << params[:badgeid]
          task.save
        end

        status 200

        return  task.to_json
      else
        return {"error" => "Task "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Remove a badge id to deliver after a task by id
  #
  # param [String] the task id
  #
  # param [String] the badge id
  #
  # return [Object] task
  put '/task/:id/removebadge/:badgeid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      task = Task.find(params[:id])
      badge = Badge.find(params[:badgeid])

      if task && badge then

        task.badges.each do |bad|
          if bad.to_s == params[:badgeid] then
            task.badges.delete(params[:badgeid])
            break;
          end
        end

        task.save!

        status 200

        return  task.to_json
      else
        return {"error" => "Task "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Delete a task by id
  #
  # param [String] the task id
  #
  # return [Object] message
  delete '/task/:id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      task = Task.find(params[:id])

      if task.destroy then
        status 200
        return {"message" => "Task "+params[:id]+" deleted"}.to_json
      else
        status 500
        return {"error" => "Task "+params[:id]+" not deleted"}.to_json
      end
    else
      status 401
      return {"error" => "Not authorised"}.to_json
    end
  end
end
