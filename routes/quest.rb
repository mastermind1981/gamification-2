class Gamification < Sinatra::Application

  # Get all quests
  #
  # return [Array] quest objects
  get '/quest' do
    if authorized?
      content_type :json
      @quest = Quest.all()
      status 200
      return @quest.to_json
    else
      status 401
    end
  end

  # Get all quests stats
  #
  # return [Array] quest objects
  get '/queststats/:classroomId' do
    if authorized?
      content_type :json

      resultObject = []
      @quest = Quest.order_by(:order.asc).all()

      @groups = Group.where(:classroom_id => params[:classroomId])

      @groups.each do |group|
        groupObject = {};
        groupObject['_id'] = group._id;
        groupObject['label'] = group.label;
        groupObject['avatarUrl'] = group.avatarUrl;
        groupObject['quests'] = [];

        @quest.each do |quest|

          if quest.assignedgroups.include?(group._id.to_s) then
            questObject = {};
            questObject['_id'] = quest._id;
            questObject['label'] = quest.label;
            questObject['locked'] = quest.locked;
            completeQuest = Completedobject.where(:quest_id => quest._id, :groupId => group._id).length;
            questObject['completed'] = completeQuest;
            questObject['levels'] = [];

            if completeQuest == 0 then

              quest.levels.each do |level|
                levelObject = {};
                levelObject['_id'] = level._id;
                levelObject['label'] = level.label;
                completeLevel = Completedobject.where(:level_id => level._id, :groupId => group._id).length;
                levelObject['completed'] = completeLevel;
                levelObject['tasks'] = [];

                if completeLevel == 0 then

                  level.tasks.each do |task|

                    taskObject = {};
                    taskObject['_id'] = task._id;
                    taskObject['label'] = task.label;
                    completeTask = Completedobject.where(:task_id => task._id, :groupId => group._id).length;
                    taskObject['completed'] = completeTask;

                    levelObject['tasks'] << taskObject;

                  end

                end

                questObject['levels'] << levelObject;
              end

            end

          groupObject['quests'] << questObject;
          end

        end

        resultObject << groupObject;
      end

      status 200
      return resultObject.to_json
    else
      status 401
    end
  end

  # Get all quests
  #
  # return [Array] quest objects
  get '/questlight' do
    if authorized?
      content_type :json
      @quest = Quest.all()
      status 200
      return @quest.to_json(:except=> [ :tasks, :completedobjects ])
    else
      status 401
    end
  end

  # Get a quest by id
  #
  # param [String] the quest id
  #
  # return [Object] quest
  get '/quest/:id' do
    if authorized?
      content_type :json
      quest = Quest.find(params[:id])
      status 200
      return quest.to_json
    else
      status 401
    end
  end

  # Get a quest by a group id
  #
  # param [String] the group id
  #
  # return [Object] quest
  get '/quest/bygroupid/:id' do
    if authorized?
      content_type :json
      @quest = Quest.order_by(:order.asc).all()

      @assignedQuests = []
      @quest.each do |quest|
        if quest.assignedgroups.include?(params[:id]) then
          @assignedQuests.push(quest);
        end
      end

      status 200
      return @assignedQuests.to_json(:except=> [ :levels, :tasks, :completedobjects ])
    else
      status 401
    end
  end

  # Create a new quest
  #
  # return [Object] quest
  post '/quest' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      quest = Quest.create()
      status 200
      return  quest.to_json
    else
      status 401
    end
  end

  # Update a quest by id
  #
  # param [String] the quest id
  #
  # body [Object] in JSON. ex: {"label":"<String>" }
  #
  # return [Object] quest
  put '/quest/:id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      quest = Quest.find(params[:id])

      if quest then
        data = JSON.parse request.body.read

        unless data['label'].nil?
          quest.update_attributes(:label => data['label'])
          quest.save
        end

        unless data['order'].nil?
          quest.update_attributes(:order => data['order'])
          quest.save
        end

        status 200

        return  quest.to_json
      else
        return {"error" => "Quest "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Add a level to a quest by id
  #
  # param [String] the quest id
  #
  # param [String] the level id
  #
  # return [Object] quest
  put '/quest/:id/addlevel/:levelid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      quest = Quest.find(params[:id])

      if quest then

        begin
          level = Level.find(params[:levelid])
        end

        if level
          quest.levels << level
          quest.save
        else
          status 500
          return {"error" => "Level "+params[:levelid]+" not found"}.to_json
        end

        status 200

        return  quest.to_json
      else
        return {"error" => "Quest "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Remove a level from a quest by id
  #
  # param [String] the quest id
  #
  # param [String] the level id
  #
  # return [Object] quest
  put '/quest/:id/removelevel/:levelid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      quest = Quest.find(params[:id])

      if quest then

        begin
          level = Level.find(params[:levelid])
        end

        if level
          quest.levels.delete(level)
          quest.save
        else
          status 500
          return {"error" => "Level "+params[:levelid]+" not found"}.to_json
        end

        status 200

        return  quest.to_json
      else
        return {"error" => "Quest "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Add an assigned group to a quest by id
  #
  # param [String] the quest id
  #
  # param [String] the level id
  #
  # return [Object] quest
  put '/quest/:id/addassignedgroup/:groupid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      quest = Quest.find(params[:id])

      if quest then

        begin
          group = Group.find(params[:groupid])
        end

        if group
          quest.assignedgroups << params[:groupid]
          quest.save
        else
          status 500
          return {"error" => "Group "+params[:groupid]+" not found"}.to_json
        end

        status 200

        return  quest.to_json
      else
        return {"error" => "Quest "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Remove an assigned group from a quest by id
  #
  # param [String] the quest id
  #
  # param [String] the group id
  #
  # return [Object] quest
  put '/quest/:id/removeassignedgroup/:groupid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      quest = Quest.find(params[:id])

      if quest then

        begin
          group = Group.find(params[:groupid])
        end

        if group
          quest.assignedgroups.delete(params[:groupid])
          quest.save
        else
          status 500
          return {"error" => "Group "+params[:groupid]+" not found"}.to_json
        end

        status 200

        return  quest.to_json
      else
        return {"error" => "Quest "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Add a completed group to a quest by id
  #
  # param [String] the quest id
  #
  # body [Object] in JSON. ex: {"groupId":"<String>", "userId":"<String>", "text":"<String>", "finishedOn":"<String>" }
  #
  # return [Object] quest
  put '/quest/:id/addcompletedgroup' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      quest = Quest.find(params[:id])

      if quest then
        data = JSON.parse request.body.read

        unless data.nil? or data['groupId'].nil? then

          if quest.assignedgroups.include?(data['groupId']) then

            #make group does not re-submit a task completion
            retrievedCompletedobject = Completedobject.where(:quest_id => params[:id], :groupId => data['groupId']).length

            if retrievedCompletedobject == 0 then
              completedobject = Completedobject.create(:text => data['text'], :userId => data['userId'], :groupId => data['groupId'], :finishedOn => Time.new().to_i);
              quest.completedobjects << completedobject
              quest.save
            end

            status 200
            return  quest.to_json
          else
            status 500
            return {"error" => "Group "+data['groupId']+" not found"}.to_json
          end

        else
          status 500
          return {"error" => "Group id missing"}.to_json
        end
      else
        return {"error" => "Quest "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Lock a quest by id
  #
  # param [String] the quest id
  #
  # return [Object] quest
  put '/quest/:id/lock' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      quest = Quest.find(params[:id])

      if quest then
        quest.update_attributes(:locked => true)
        quest.save

        status 200

        return  quest.to_json
      else
        return {"error" => "Quest "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end



  # Unlock a quest by id
  #
  # param [String] the quest id
  #
  # return [Object] quest
  put '/quest/:id/unlock' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      quest = Quest.find(params[:id])

      if quest then
        quest.update_attributes(:locked => false)
        quest.save

        status 200

        return  quest.to_json
      else
        return {"error" => "Quest "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Add an id to unlock to a quest by id
  #
  # param [String] the quest id
  #
  # return [Object] quest
  put '/quest/:id/addidtounlock/:unid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      quest = Quest.find(params[:id])

      if quest then
        quest.idstounlock << params[:unid]
        quest.save

        status 200

        return  quest.to_json
      else
        return {"error" => "Quest "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Remove an id to unlock to a quest by id
  #
  # param [String] the quest id
  #
  # return [Object] quest
  put '/quest/:id/removeidtounlock/:unid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      quest = Quest.find(params[:id])

      if quest then
        quest.idstounlock.delete(params[:unid])
        quest.save

        status 200

        return  quest.to_json
      else
        return {"error" => "Quest "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Delete a quest by id
  #
  # param [String] the quest id
  #
  # return [Object] message
  delete '/quest/:id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      quest = Quest.find(params[:id])

      if quest.levels.empty? then
        if quest.destroy then
          status 200
          return {"message" => "Quest "+params[:id]+" deleted"}.to_json
        else
          status 500
          return {"error" => "Quest "+params[:id]+" not deleted"}.to_json
        end
      else
        status 401
        return {"error" => "This quest has completed levels. Delete those first before deleting this quest."}.to_json
      end
    else
      status 401
      return {"error" => "Not authorised"}.to_json
    end
  end
end
