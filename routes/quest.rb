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

  # Get all quests
  #
  # return [Array] quest objects
  get '/adminquest' do
    if authorized?
      content_type :json

      @graph = Koala::Facebook::API.new(session["access_token"])
      user = @graph.get_object("me")

      @quest = Quest.where(:author => user["id"])
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
        groupObject['students'] = group.students;
        groupObject['quests'] = [];
        groupObject['blogUrl'] = group.blogUrl;

        badgeauto = 0;
        badgemanu = 0;
        badgespec = 0;
        group.badges.each do |badge|
          case badge['deliverytype']
            when 'AUTOMATIC'
              badgeauto = badgeauto + badge['count'].to_i
            when 'MANUAL'
              badgemanu = badgemanu + badge['count'].to_i
            when 'SPECIAL'
              badgespec = badgespec + badge['count'].to_i
          end
        end

        groupObject['deliverytype'] = {"automatic" => badgeauto, "manual" => badgemanu, "special" => badgespec};

        @quest.each do |quest|

          if quest.assignedgroups.include?(group._id.to_s) then
            questObject = {};
            questObject['_id'] = quest._id;
            questObject['label'] = quest.label;
            questObject['order'] = quest.order;
            questObject['locked'] = quest.unlockedgroups.include?(group._id.to_s);
            completeQuest = Completedobject.where(:quest_id => quest._id, :groupId => group._id).length;
            questObject['completed'] = completeQuest;
            questObject['levels'] = [];

            if completeQuest == 0 then

              quest.levels.each do |level|
                levelObject = {};
                levelObject['_id'] = level._id;
                levelObject['label'] = level.label;
                levelObject['order'] = level.order;
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

  # Get a quest by id for a group id
  #
  # param [String] the quest id
  # param [String] the group id
  #
  # return [Object] quest
  get '/quest/:id/bygroupid/:grpid' do
    if authorized?
      content_type :json
      quest = Quest.find(params[:id])
      quest['hasaccess'] = quest.unlockedgroups.include?(params[:grpid]);

      quest.levels.each do |level|
        level['hasaccess'] = level.unlockedgroups.include?(params[:grpid])
      end

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

          completeQuest = Completedobject.where(:quest_id => quest._id, :groupId => params[:id]).length;
          quest['completed'] = completeQuest;
          quest['hasaccess'] = quest.unlockedgroups.include?(params[:id]);

          @assignedQuests.push(quest);
        end
      end

      status 200
      return @assignedQuests.to_json(:except=> [ :levels, :tasks ])
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

      @graph = Koala::Facebook::API.new(session["access_token"])
      user = @graph.get_object("me")

      quest = Quest.create(:author => user["id"])
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
        end

        unless data['order'].nil?
          quest.update_attributes(:order => data['order'])
        end

        unless data['locked'].nil?

          quest.update_attributes(:locked => data['locked'])
          quest.update_attributes(:unlockedgroups => [])

            if data['locked'] == false then
              quest.assignedgroups.each do |grpid|
                quest.unlockedgroups << grpid
              end
            end
        end

        #unless data['author'].nil?
        #  quest.update_attributes(:author => data['author'])
        #  quest.save
        #end

        status 200

        quest.save
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

        if group then
          if quest.assignedgroups.include?(group._id.to_s) == false then
            quest.assignedgroups << params[:groupid]
          end

          if quest.locked == false then
            if quest.unlockedgroups.include?(group._id.to_s) == false then
              quest.unlockedgroups << group._id.to_s
            end

            quest.levels.each do |level|
              if level.locked == false then
                level.unlockedgroups << params[:groupid]
              end
            end
          end

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
        quest.update_attributes(:unlockedgroups => [])
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
        quest.update_attributes(:unlockedgroups => [])
        quest.assignedgroups.each do |grpid|
          quest.unlockedgroups << grpid
        end
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


  # Unlock a quest by id for a group id
  #
  # param [String] the quest id
  #
  # return [Object] quest
  put '/quest/:id/unlockfor/:grpid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      quest = Quest.find(params[:id])

      if quest then
        if quest.unlockedgroups.include?(params[:grpid].to_s) == false then
          quest.unlockedgroups << params[:grpid]
        end
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
  put '/quest/:id/addidtounlock' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      quest = Quest.find(params[:id])

      if quest then
        doNotExists = true;
        data = JSON.parse request.body.read

        quest.idstounlock.each do |idd|
          if idd["unid"] == data['unid'] then
            doNotExists = false;
          end
        end

        if doNotExists then
          quest.idstounlock << {:unid => data['unid'], :type => data['type']}
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

  # Add a badge id to deliver after a quest by id
  #
  # param [String] the quest id
  #
  # param [String] the badge id
  #
  # return [Object] quest
  put '/quest/:id/addbadge/:badgeid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      quest = Quest.find(params[:id])
      badge = Badge.find(params[:badgeid])

      if quest && badge then

        doNotExists = true;

        quest.badges.each do |bad|
          if bad.to_s == params[:badgeid] then
            doNotExists = false;
            break;
          end
        end

        if doNotExists then
          quest.badges << params[:badgeid]
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

  # Remove a badge id to deliver after a quest by id
  #
  # param [String] the quest id
  #
  # param [String] the badge id
  #
  # return [Object] quest
  put '/quest/:id/removebadge/:badgeid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      quest = Quest.find(params[:id])
      badge = Badge.find(params[:badgeid])

      if quest && badge then

        quest.badges.each do |bad|
          if bad.to_s == params[:badgeid] then
            quest.badges.delete(params[:badgeid])
            break;
          end
        end

        quest.save!

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
